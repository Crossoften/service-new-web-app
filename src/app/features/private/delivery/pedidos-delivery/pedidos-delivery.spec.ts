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

  it('separa pedidos por aba: Ativos (em jogo) x Histórico (terminais)', () => {
    component.pedidos = [
      { id: 1, status: 'Preparing', restaurant: { id: 5, name: 'A' } },
      { id: 2, status: 'OnTheWay', restaurant: { id: 5, name: 'A' } },
      { id: 3, status: 'Delivered', restaurant: { id: 5, name: 'A' } },
      { id: 4, status: 'Cancelled', restaurant: { id: 5, name: 'A' } },
    ] as never;

    component.selecionarAba('ativos');
    expect(component.pedidosFiltrados.map((p) => p.id)).toEqual([1, 2]);

    component.selecionarAba('historico');
    expect(component.pedidosFiltrados.map((p) => p.id)).toEqual([3, 4]);
  });

  it('ehAtivo reconhece os status não-terminais', () => {
    expect(component.ehAtivo({ status: 'Received' } as never)).toBe(true);
    expect(component.ehAtivo({ status: 'Accepted' } as never)).toBe(true);
    expect(component.ehAtivo({ status: 'Delivered' } as never)).toBe(false);
    expect(component.ehAtivo({ status: 'Cancelled' } as never)).toBe(false);
  });
});
