import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
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

  it('abre o modal de garantia quando dentro da validade (sem window.prompt)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', isUnderWarranty: true, warrantyExpiresAt: '2026-09-16T00:00:00.000Z' }),
    );
    expect(component.podeSolicitarGarantia).toBe(true);
    component.solicitarGarantia();
    expect(component.mostrarModalGarantia).toBe(true);
    httpMock.expectNone((r) => r.url.endsWith('/works/1/request-warranty'));
  });

  it('envia a solicitação de garantia com a descrição (POST request-warranty)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', isUnderWarranty: true }),
    );
    component.solicitarGarantia();
    component.enviarGarantia();
    expect(component.erro).toContain('Descreva');
    httpMock.expectNone((r) => r.url.endsWith('/works/1/request-warranty'));

    component.descricaoGarantia = 'O problema voltou.';
    component.enviarGarantia();
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/works/1/request-warranty') && r.method === 'POST',
    );
    expect(req.request.body.description).toBe('O problema voltou.');
    req.flush(workResponse({ status: 'Finished', warrantyRequestStatus: 'Pending' }));
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', warrantyRequestStatus: 'Pending' }),
    );
    expect(component.mostrarModalGarantia).toBe(false);
  });

  it('bloqueia nova solicitação quando já há garantia pendente', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', isUnderWarranty: true, warrantyRequestStatus: 'Pending' }),
    );
    expect(component.podeSolicitarGarantia).toBe(false);
    expect(component.solicitacao?.garantiaStatus).toBe('Pending');
  });

  it('expõe a resposta do fornecedor quando a garantia foi respondida', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({
        status: 'Finished',
        warrantyRequestStatus: 'Approved',
        warrantyResponseDescription: 'Ajuste sem custo agendado.',
      }),
    );
    expect(component.solicitacao?.garantiaStatus).toBe('Approved');
    expect(component.solicitacao?.garantiaResposta).toBe('Ajuste sem custo agendado.');
    expect(component.works.garantiaStatusLabel('Approved')).toBe('Garantia aprovada');
  });

  // ── Reparo (BE-W1): sem custo e sem garantia de garantia ────────────────────

  it('reparo: não permite solicitar garantia mesmo dentro da validade', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', isWarranty: true, isUnderWarranty: true }),
    );
    expect(component.ehGarantia).toBe(true);
    expect(component.podeSolicitarGarantia).toBe(false);
  });

  it('reparo: "serviço concluído" volta à lista sem ir ao pagamento (sem custo)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', isWarranty: true }),
    );
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.servicoConcluido();
    expect(nav).toHaveBeenCalledWith(['/servicos/solicitacoes']);
  });

  it('reparo: expõe o serviço original e navega até ele', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', isWarranty: true, parentWorkId: 7 }),
    );
    expect(component.solicitacao?.trabalhoOriginalId).toBe(7);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrirSolicitacao(component.solicitacao?.trabalhoOriginalId);
    expect(nav).toHaveBeenCalledWith(['/servicos/solicitacao', 7]);
  });

  it('original: lista os reparos abertos (warrantyWorks)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      workResponse({ status: 'Finished', warrantyWorks: [{ id: 20, status: 'Finished' }] }),
    );
    expect(component.solicitacao?.reparos).toEqual([{ id: 20, status: 'Finished' }]);
    expect(component.reparoStatusLabel('Finished')).toBe('Concluído');
  });
});
