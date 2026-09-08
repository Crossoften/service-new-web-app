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

  it('pagarPedido chama POST /food-orders/:id/pay', () => {
    service.pagarPedido(9, 'cliente@example.com').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders/9/pay') && r.method === 'POST');
    expect(req.request.body.payerEmail).toBe('cliente@example.com');
    req.flush({ message: 'ok', checkoutUrl: 'https://mp/checkout', foodOrder: { id: 9 } });
  });

  it('mapeia o tempo de entrega ("30-45 min") a partir dos minutos', () => {
    let tempo = '';
    service.getRestaurante(1).subscribe((r) => (tempo = r.tempo));
    httpMock
      .expectOne((r) => r.url.endsWith('/restaurants/1'))
      .flush({
        id: 1,
        name: 'Cantina',
        isActive: true,
        isOpen: true,
        category: { id: 2, name: 'Lanches', slug: 'lanches' },
        deliveryTimeMinMinutes: 30,
        deliveryTimeMaxMinutes: 45,
      });
    expect(tempo).toBe('30-45 min');
  });

  it('tempo de entrega vazio quando não informado', () => {
    let tempo = 'x';
    service.getRestaurante(2).subscribe((r) => (tempo = r.tempo));
    httpMock
      .expectOne((r) => r.url.endsWith('/restaurants/2'))
      .flush({
        id: 2,
        name: 'Sem tempo',
        isActive: true,
        isOpen: true,
        category: { id: 2, name: 'Lanches', slug: 'lanches' },
      });
    expect(tempo).toBe('');
  });
});
