import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DeliveryService } from './delivery';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DeliveryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('criarPedido mapeia "dinheiro" → Cash e não envia deliveryFee', () => {
    service.setPedidoRestaurante({ id: 7 } as never);
    service.addItem({ id: 3, preco: 10 } as never, 2, []);
    service.setOpcaoEntrega({ preco: 8 } as never);
    service.setFormaPagamento('dinheiro');

    service.criarPedido().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders') && r.method === 'POST');
    expect(req.request.body.paymentMethod).toBe('Cash');
    expect('deliveryFee' in req.request.body).toBe(false);
    expect(req.request.body.items[0]).toEqual({ menuItemId: 3, quantity: 2, additionIds: [] });
    req.flush({ message: 'ok', foodOrder: { id: 1 } });
  });

  it('mapeia "debito" → DebitCard', () => {
    service.setPedidoRestaurante({ id: 1 } as never);
    service.addItem({ id: 1, preco: 5 } as never, 1, []);
    service.setFormaPagamento('debito');
    service.criarPedido().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders'));
    expect(req.request.body.paymentMethod).toBe('DebitCard');
    req.flush({ message: 'ok', foodOrder: { id: 2 } });
  });
});
