import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AprovarOrcamentoComponent } from './aprovar-orcamento';

describe('AprovarOrcamentoComponent', () => {
  let component: AprovarOrcamentoComponent;
  let fixture: ComponentFixture<AprovarOrcamentoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovarOrcamentoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AprovarOrcamentoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/budgets/1')).flush({
      id: 1, description: 'Reparo', status: 'Responded', responseDescription: 'Posso fazer', responseValue: '350.00',
      responseTimeQuantity: 3, responseTimeUnit: 'Day', serviceId: 3, service: { id: 3, name: 'Reforma' },
      requesterId: 2, requester: { id: 2, name: 'Ana' }, providerId: 9, provider: { id: 9, name: 'Joelson' },
      files: [], createdAt: '2026-01-01T10:00:00Z', updatedAt: '',
    });
  });

  afterEach(() => httpMock.verify());

  it('carrega e mapeia o orçamento', () => {
    expect(component.orcamento?.valor).toBe(350);
    expect(component.orcamento?.previsaoFim).toContain('dia');
  });

  it('aprova o orçamento (PATCH approve)', () => {
    component.solicitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets/1/approve') && r.method === 'PATCH');
    req.flush({ message: 'ok', work: { id: 5 } });
    expect(component.erro).toBe('');
  });

  it('podeDecidir só em Responded', () => {
    expect(component.podeDecidir).toBe(true); // carregado como Responded
    component.orcamento!.statusApi = 'Accepted';
    expect(component.podeDecidir).toBe(false);
    component.orcamento!.statusApi = 'Rejected';
    expect(component.podeDecidir).toBe(false);
  });

  it('recusa o orçamento com motivo (PATCH reject) — §8.8', () => {
    component.alternarRecusa();
    expect(component.mostrandoRecusa).toBe(true);
    component.motivoRecusa = '  Achei o prazo longo demais.  ';
    component.rejeitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets/1/reject') && r.method === 'PATCH');
    expect(req.request.body).toEqual({ rejectReason: 'Achei o prazo longo demais.' });
    req.flush({ id: 1, status: 'Rejected' });
    expect(component.erro).toBe('');
  });

  it('recusa sem motivo omite rejectReason', () => {
    component.motivoRecusa = '   ';
    component.rejeitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets/1/reject'));
    expect(req.request.body).toEqual({ rejectReason: undefined });
    req.flush({ id: 1, status: 'Rejected' });
  });

  it('desfechoLabel reflete o status terminal', () => {
    component.orcamento!.statusApi = 'Accepted';
    expect(component.desfechoLabel).toBe('Orçamento aceito');
    component.orcamento!.statusApi = 'Rejected';
    expect(component.desfechoLabel).toBe('Orçamento recusado');
    component.orcamento!.statusApi = 'Cancelled';
    expect(component.desfechoLabel).toBe('Pedido cancelado');
  });
});
