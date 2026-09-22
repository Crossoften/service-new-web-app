import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { PagamentoServicoComponent } from './pagamento-servico';
import { errorInterceptor } from '../../../../core/interceptors/error-interceptor';

function work(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'Finished', isUnderWarranty: false,
    budgetId: 5, budget: { id: 5 }, serviceId: 3, service: { id: 3, name: 'Reforma' },
    requesterId: 2, requester: { id: 2, name: 'Ana' }, providerId: 9, provider: { id: 9, name: 'Joelson' },
    serviceValue: '350.00', totalValue: '350.00', files: [],
    createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z',
    ...overrides,
  };
}

describe('PagamentoServicoComponent', () => {
  let component: PagamentoServicoComponent;
  let fixture: ComponentFixture<PagamentoServicoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagamentoServicoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoServicoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(work());
  });

  afterEach(() => httpMock.verify());

  it('gera o checkout Mercado Pago (POST /works/1/pay, corpo vazio)', () => {
    expect(component.podePagar).toBe(true);
    component.efetuarPagamento();
    // Não fazemos flush: o next redireciona o browser para a checkoutUrl.
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/1/pay') && r.method === 'POST');
    expect(req.request.body).toEqual({});
    expect(component.processando).toBe(true);
  });

  it('mostra a mensagem da API quando o fornecedor não tem conta MP vinculada', () => {
    component.efetuarPagamento();
    const req = httpMock.expectOne((r) => r.url.endsWith('/works/1/pay') && r.method === 'POST');
    req.flush(
      { message: 'Fornecedor sem conta de recebimento vinculada.' },
      { status: 409, statusText: 'Conflict' },
    );
    expect(component.processando).toBe(false);
    expect(component.erro).toContain('conta de recebimento');
  });

  it('não paga quando o serviço já está pago', () => {
    // Recria com trabalho já pago.
    fixture = TestBed.createComponent(PagamentoServicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/works/1') && r.method === 'GET').flush(
      work({ payment: { id: 7, method: 'Pix', status: 'Paid' } }),
    );
    expect(component.podePagar).toBe(false);
    component.efetuarPagamento();
    httpMock.expectNone((r) => r.url.endsWith('/works/1/pay'));
  });
});
