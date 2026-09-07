import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { RevisaoPedidoComponent } from './revisao-pedido';
import { DeliveryService } from '../../../../core/services/delivery';
import { errorInterceptor } from '../../../../core/interceptors/error-interceptor';

const MP_MSG = 'O vendedor ainda não vinculou uma conta do Mercado Pago para receber pagamentos.';

describe('RevisaoPedidoComponent', () => {
  let component: RevisaoPedidoComponent;
  let fixture: ComponentFixture<RevisaoPedidoComponent>;
  let httpMock: HttpTestingController;
  let service: DeliveryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisaoPedidoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RevisaoPedidoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DeliveryService);

    // Sacola válida, forma não-dinheiro.
    service.setPedidoRestaurante({ id: 7 } as never);
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    service.setFormaPagamento('pix');
    component.pedido = service.getPedidoAtual();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('no 400 de restaurante sem Mercado Pago, oferece pagar em dinheiro', () => {
    component.finalizarPedido();
    httpMock
      .expectOne((r) => r.url.endsWith('/food-orders') && r.method === 'POST')
      .flush({ message: MP_MSG }, { status: 400, statusText: 'Bad Request' });
    expect(component.sugerirDinheiro).toBe(true);
    expect(component.erro.toLowerCase()).toContain('dinheiro');
  });

  it('pagarEmDinheiro reenvia o pedido como Cash e vai para o status', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');

    component.finalizarPedido();
    httpMock
      .expectOne((r) => r.url.endsWith('/food-orders'))
      .flush({ message: MP_MSG }, { status: 400, statusText: 'Bad Request' });

    component.pagarEmDinheiro();
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders') && r.method === 'POST');
    expect(req.request.body.paymentMethod).toBe('Cash');
    req.flush({ message: 'ok', foodOrder: { id: 55 } });
    expect(nav).toHaveBeenCalledWith(['/delivery/status', 55]);
  });
});
