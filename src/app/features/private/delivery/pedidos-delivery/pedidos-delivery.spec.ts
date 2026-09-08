import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PedidosDeliveryComponent } from './pedidos-delivery';
import { DeliveryService } from '../../../../core/services/delivery';

describe('PedidosDeliveryComponent', () => {
  let component: PedidosDeliveryComponent;
  let fixture: ComponentFixture<PedidosDeliveryComponent>;
  let service: DeliveryService;

  const evt = { stopPropagation: () => {} } as Event;
  const pedido = { id: 1, restaurant: { id: 5 }, items: [] } as never;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosDeliveryComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosDeliveryComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(DeliveryService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pedirNovamente vai para a sacola quando algo foi adicionado', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(service, 'repetirPedido').mockReturnValue(of({ adicionados: 2, indisponiveis: 1 }));
    component.pedirNovamente(pedido, evt);
    expect(component.aviso).toContain('1 item');
    expect(nav).toHaveBeenCalledWith(['/delivery/sacola']);
  });

  it('pedirNovamente mostra erro e não navega quando nada disponível', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(service, 'repetirPedido').mockReturnValue(of({ adicionados: 0, indisponiveis: 3 }));
    component.pedirNovamente(pedido, evt);
    expect(component.erro).toContain('não estão mais disponíveis');
    expect(nav).not.toHaveBeenCalled();
  });
});
