import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { FazerOrcamentoComponent } from './fazer-orcamento';

describe('FazerOrcamentoComponent', () => {
  let component: FazerOrcamentoComponent;
  let fixture: ComponentFixture<FazerOrcamentoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FazerOrcamentoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FazerOrcamentoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/budgets/1') && r.method === 'GET').flush({
      id: 1, description: 'Reparo', status: 'Pending', serviceId: 3, service: { id: 3, name: 'Reforma' },
      requesterId: 2, requester: { id: 2, name: 'Ana' }, providerId: 9, provider: { id: 9, name: 'Joelson' },
      files: [], createdAt: '', updatedAt: '',
    });
  });

  afterEach(() => httpMock.verify());

  it('exige valor válido', () => {
    component.enviar();
    expect(component.erro).toContain('valor');
    httpMock.expectNone((r) => r.url.endsWith('/budgets/1') && r.method === 'PATCH');
  });

  it('responde o orçamento (PATCH) com valor e prazo', () => {
    component.valor = '500';
    component.diasPrevistos = '15 dias';
    component.enviar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets/1') && r.method === 'PATCH');
    expect(req.request.body.status).toBe('Responded');
    expect(req.request.body.responseValue).toBe(500);
    expect(req.request.body.responseTimeQuantity).toBe(15);
    expect(req.request.body.responseTimeUnit).toBe('Day');
    req.flush({ id: 1, status: 'Responded' });
  });

  it('pede mais informações (PATCH request-more-information)', () => {
    component.maisInfosDescricao = 'Preciso da metragem';
    component.confirmarMaisInfos();
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets/1/request-more-information'));
    expect(req.request.body.message).toBe('Preciso da metragem');
    req.flush({ id: 1 });
    expect(component.mostrarModalMaisInfos).toBe(false);
  });
});
