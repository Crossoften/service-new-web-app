import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { StatusPedidoComponent } from './status-pedido';
import { ResponseFoodOrderDto } from '../../../../core/models/food-order';

function pedido(over: Partial<ResponseFoodOrderDto>): ResponseFoodOrderDto {
  return {
    id: 5,
    status: 'Received',
    paymentMethod: 'Pix',
    paymentStatus: 'Pending',
    ...over,
  } as ResponseFoodOrderDto;
}

describe('StatusPedidoComponent', () => {
  let component: StatusPedidoComponent;
  let fixture: ComponentFixture<StatusPedidoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPedidoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPedidoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // Não chamamos detectChanges: evita disparar o polling do ngOnInit.
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('podePagar: true para não-dinheiro pendente', () => {
    component.pedido = pedido({ paymentMethod: 'Pix', paymentStatus: 'Pending' });
    expect(component.podePagar).toBe(true);
  });

  it('podePagar: false para dinheiro e para já pago', () => {
    component.pedido = pedido({ paymentMethod: 'Cash', paymentStatus: 'Pending' });
    expect(component.podePagar).toBe(false);
    component.pedido = pedido({ paymentMethod: 'Pix', paymentStatus: 'Paid' });
    expect(component.podePagar).toBe(false);
  });

  it('pagar() gera o checkout no POST /food-orders/:id/pay', () => {
    component.pedidoId = 5;
    component.pedido = pedido({ paymentMethod: 'Pix', paymentStatus: 'Pending' });
    component.pagar();
    // Não fazemos flush: o next redireciona o browser para a checkoutUrl.
    const req = httpMock.expectOne((r) => r.url.endsWith('/food-orders/5/pay') && r.method === 'POST');
    expect(component.pagando).toBe(true);
  });

  it('pagar() é ignorado para pedido em dinheiro', () => {
    component.pedidoId = 5;
    component.pedido = pedido({ paymentMethod: 'Cash', paymentStatus: 'Pending' });
    component.pagar();
    httpMock.expectNone((r) => r.url.endsWith('/food-orders/5/pay'));
  });
});
