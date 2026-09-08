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

  it('envia a observação do item como notes (e omite quando vazia)', () => {
    service.setPedidoRestaurante({ id: 7 } as never);
    service.addItem({ id: 3, preco: 10 } as never, 1, [], 'sem cebola');
    service.addItem({ id: 4, preco: 5 } as never, 1, [], '   '); // só espaços → omitido
    service.setFormaPagamento('pix');
    service.criarPedido().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders') && r.method === 'POST');
    expect(req.request.body.items[0].notes).toBe('sem cebola');
    expect(req.request.body.items[1].notes).toBeUndefined();
    req.flush({ message: 'ok', foodOrder: { id: 3 } });
  });

  it('alterarQuantidade respeita o mínimo de 1 e removerItem tira a linha', () => {
    service.setPedidoRestaurante({ id: 7 } as never);
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    service.addItem({ id: 4, preco: 5 } as never, 2, []);
    service.alterarQuantidade(0, 3);
    expect(service.getPedidoAtual().itens?.[0].quantidade).toBe(4);
    service.alterarQuantidade(0, -10); // não passa de 1
    expect(service.getPedidoAtual().itens?.[0].quantidade).toBe(1);
    service.removerItem(0);
    expect(service.getPedidoAtual().itens?.length).toBe(1);
    expect(service.getPedidoAtual().itens?.[0].item.id).toBe(4);
  });

  it('repetirPedido remonta a sacola pelo cardápio atual (ignora itens sumidos)', () => {
    const pedido = {
      id: 99,
      restaurant: { id: 5, name: 'R' },
      items: [
        {
          id: 1, menuItemId: 10, name: 'X', quantity: 2, unitPrice: '25.00',
          notes: 'sem cebola', additions: [{ id: 1, name: 'Bacon', price: '5.00' }],
        },
        { id: 2, menuItemId: 999, name: 'Sumiu', quantity: 1, unitPrice: '0', additions: [] },
      ],
    } as never;

    let resultado: { adicionados: number; indisponiveis: number } | undefined;
    service.repetirPedido(pedido).subscribe((r) => (resultado = r));

    httpMock.expectOne((r) => r.url.endsWith('/restaurants/5')).flush({
      id: 5, name: 'R', isActive: true, isOpen: true,
      category: { id: 2, name: 'Lanches', slug: 'lanches' },
      menuCategories: [
        {
          id: 1, name: 'C', sortOrder: 0,
          items: [
            {
              id: 10, name: 'X', price: '20.00', isActive: true, menuCategoryId: 1,
              additions: [{ id: 1, name: 'Bacon', price: '5.00', isActive: true }],
            },
          ],
        },
      ],
    });

    expect(resultado).toEqual({ adicionados: 1, indisponiveis: 1 });
    const cart = service.getPedidoAtual();
    expect(cart.restaurante?.id).toBe(5);
    expect(cart.itens?.length).toBe(1);
    expect(cart.itens?.[0].item.id).toBe(10);
    expect(cart.itens?.[0].quantidade).toBe(2);
    expect(cart.itens?.[0].observacao).toBe('sem cebola');
    expect(cart.itens?.[0].adicionaisSelecionados.map((a) => a.id)).toEqual([1]);
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

  it('mapeia aberto (isOpen) e tempoMinMinutos no restaurante', () => {
    let aberto: boolean | undefined;
    let tempoMin: number | undefined;
    service.getRestaurante(1).subscribe((r) => {
      aberto = r.aberto;
      tempoMin = r.tempoMinMinutos;
    });
    httpMock.expectOne((r) => r.url.endsWith('/restaurants/1')).flush({
      id: 1, name: 'Cantina', isActive: true, isOpen: false,
      category: { id: 2, name: 'Lanches', slug: 'lanches' },
      deliveryTimeMinMinutes: 20, deliveryFee: 0,
    });
    expect(aberto).toBe(false);
    expect(tempoMin).toBe(20);
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
