import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalhesSolicitacaoComponent } from './detalhes-solicitacao';

function workResponse(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'InProgress', isUnderWarranty: false,
    budgetId: 5, budget: { id: 5 }, serviceId: 3, service: { id: 3, name: 'Reforma' },
    requesterId: 2, requester: { id: 2, name: 'Ana' },
    providerId: 9, provider: { id: 9, name: 'Joelson' },
    serviceValue: '350.00', totalValue: '350.00', files: [],
    createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z',
    ...overrides,
  };
}

describe('DetalhesSolicitacaoComponent', () => {
  let component: DetalhesSolicitacaoComponent;
  let fixture: ComponentFixture<DetalhesSolicitacaoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesSolicitacaoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesSolicitacaoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega o trabalho e deriva o step por status (GET /works/1)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(workResponse());
    expect(component.solicitacao?.prestador.nome).toBe('Joelson');
    expect(component.stepAtual).toBe('em_andamento');
  });

  it('confirma chegada (PATCH confirm-arrival) e recarrega', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(workResponse());
    component.confirmarChegada();
    const patch = httpMock.expectOne((r) => r.url.endsWith('/works/1/confirm-arrival') && r.method === 'PATCH');
    patch.flush(workResponse({ arrivalConfirmedAt: '2026-03-16T10:15:00.000Z' }));
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ arrivalConfirmedAt: '2026-03-16T10:15:00.000Z' }),
    );
    expect(component.solicitacao?.arrivalConfirmed).toBe(true);
  });

  it('aprova o acréscimo pendente (PATCH respond-extra)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ extraRequestStatus: 'Pending', extraRequestValue: '80.00' }),
    );
    expect(component.mostrarModal).toBe(true);
    component.confirmarModal();
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/1/respond-extra') && r.method === 'PATCH');
    expect(req.request.body.status).toBe('Approved');
    req.flush(workResponse());
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(workResponse());
    expect(component.mostrarModal).toBe(false);
  });
});
