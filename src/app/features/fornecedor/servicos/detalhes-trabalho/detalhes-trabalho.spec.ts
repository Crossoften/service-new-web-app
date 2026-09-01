import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalhesTrabalhoComponent } from './detalhes-trabalho';

function workResponse(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'Pending', isUnderWarranty: false,
    budgetId: 5, budget: { id: 5 }, serviceId: 3, service: { id: 3, name: 'Reforma' },
    requesterId: 2, requester: { id: 2, name: 'Ana' },
    providerId: 9, provider: { id: 9, name: 'Joelson' },
    serviceValue: '350.00', totalValue: '350.00', files: [],
    createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z',
    ...overrides,
  };
}

describe('DetalhesTrabalhoComponent', () => {
  let component: DetalhesTrabalhoComponent;
  let fixture: ComponentFixture<DetalhesTrabalhoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesTrabalhoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesTrabalhoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega o trabalho e deriva step inicial (Pending)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(workResponse());
    expect(component.trabalho?.cliente).toBe('Ana');
    expect(component.stepAtual).toBe('inicial');
  });

  it('inicia sem acréscimo (PATCH start apenas)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(workResponse());
    component.confirmarAcrescimo();
    httpMock.expectOne((r) => r.url.endsWith('/works/1/start') && r.method === 'PATCH').flush(
      workResponse({ status: 'InProgress' }),
    );
    httpMock.expectNone((r) => r.url.endsWith('/works/1/request-extra'));
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'InProgress' }),
    );
    expect(component.stepAtual).toBe('em_andamento');
  });

  it('inicia com acréscimo (start + request-extra)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(workResponse());
    component.justificativa = 'Reparo adicional';
    component.valorAcrescimo = '80';
    component.confirmarAcrescimo();
    httpMock.expectOne((r) => r.url.endsWith('/works/1/start')).flush(workResponse({ status: 'InProgress' }));
    const extra = httpMock.expectOne((r) => r.url.endsWith('/works/1/request-extra') && r.method === 'PATCH');
    expect(extra.request.body.value).toBe(80);
    expect(extra.request.body.description).toBe('Reparo adicional');
    extra.flush(workResponse({ status: 'InProgress' }));
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'InProgress' }),
    );
  });

  it('finaliza o serviço exigindo descrição (PATCH finish)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'InProgress' }),
    );
    component.enviarResposta();
    expect(component.erro).toContain('Descreva');
    httpMock.expectNone((r) => r.url.endsWith('/works/1/finish'));

    component.respostaDescricao = 'Serviço concluído conforme combinado.';
    component.enviarResposta();
    const finish = httpMock.expectOne((r) => r.url.endsWith('/works/1/finish') && r.method === 'PATCH');
    expect(finish.request.body.completionDescription).toBe('Serviço concluído conforme combinado.');
    finish.flush(workResponse({ status: 'Finished' }));
  });
});
