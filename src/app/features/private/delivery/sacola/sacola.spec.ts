import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { SacolaComponent } from './sacola';
import { DeliveryService } from '../../../../core/services/delivery';

describe('SacolaComponent', () => {
  let component: SacolaComponent;
  let fixture: ComponentFixture<SacolaComponent>;
  let service: DeliveryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SacolaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SacolaComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(DeliveryService);
    service.setPedidoRestaurante({ id: 7 } as never);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('subtotalItem soma adicionais e multiplica pela quantidade', () => {
    component.ngOnInit();
    const ip = { item: { preco: 10 }, quantidade: 2, adicionaisSelecionados: [{ preco: 3 }] } as never;
    expect(component.subtotalItem(ip)).toBe(26); // (10 + 3) × 2
  });

  it('incrementar/decrementar ajustam a quantidade (mínimo 1)', () => {
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    component.ngOnInit();
    component.incrementar(0);
    expect(component.itens[0].quantidade).toBe(2);
    component.decrementar(0);
    component.decrementar(0); // não passa de 1
    expect(component.itens[0].quantidade).toBe(1);
  });

  it('remover tira a linha da sacola', () => {
    service.addItem({ id: 3, preco: 10 } as never, 1, []);
    service.addItem({ id: 4, preco: 5 } as never, 1, []);
    component.ngOnInit();
    component.remover(0);
    expect(component.itens.length).toBe(1);
    expect(component.itens[0].item.id).toBe(4);
  });

  it('continuar não navega com a sacola vazia', () => {
    const router = TestBed.inject(Router);
    const nav = vi.spyOn(router, 'navigate');
    component.ngOnInit(); // sem itens
    component.continuar();
    expect(nav).not.toHaveBeenCalled();
  });
});
