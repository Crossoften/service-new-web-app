import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalhesPedidoFornecedorComponent } from './detalhes-pedido-fornecedor';

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 1, status: 'Delivered', itemsValue: '30.00', deliveryFee: '8.00', totalValue: '38.00',
    paymentMethod: 'Cash', paymentStatus: 'Pending', chatRoomId: 4,
    restaurant: { id: 2, name: 'R', userId: 9 }, customer: { id: 5, name: 'Ana' },
    items: [], createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z',
    ...overrides,
  };
}

describe('DetalhesPedidoFornecedorComponent', () => {
  let component: DetalhesPedidoFornecedorComponent;
  let fixture: ComponentFixture<DetalhesPedidoFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesPedidoFornecedorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesPedidoFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('habilita confirmar pagamento para Cash + Pending', () => {
    httpMock.expectOne((r) => r.url.endsWith('/food-orders/1') && r.method === 'GET').flush(order());
    expect(component.podeConfirmarPagamento).toBe(true);
    expect(component.formaPagamentoLabel).toBe('Dinheiro');
  });

  it('não habilita para pagamento já pago', () => {
    httpMock.expectOne((r) => r.url.endsWith('/food-orders/1')).flush(order({ paymentStatus: 'Paid' }));
    expect(component.podeConfirmarPagamento).toBe(false);
  });

  it('confirmarPagamento chama PATCH confirm-payment', () => {
    httpMock.expectOne((r) => r.url.endsWith('/food-orders/1')).flush(order());
    component.confirmarPagamento();
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders/1/confirm-payment') && r.method === 'PATCH');
    req.flush(order({ paymentStatus: 'Paid' }));
    expect(component.pedido?.paymentStatus).toBe('Paid');
  });
});
