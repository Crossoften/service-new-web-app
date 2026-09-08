import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { CardapioItemComponent } from './cardapio-item';
import { DeliveryService } from '../../../../core/services/delivery';

describe('CardapioItemComponent', () => {
  let component: CardapioItemComponent;
  let fixture: ComponentFixture<CardapioItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardapioItemComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CardapioItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adicionar() envia a observação (trim) para o carrinho', () => {
    const service = TestBed.inject(DeliveryService);
    const add = vi.spyOn(service, 'addItem').mockImplementation(() => {});
    component.item = { id: 3, nome: 'X', preco: 10, adicionais: [] } as never;
    component.quantidade = 2;
    component.observacao = '  sem cebola  ';
    component.adicionar();
    expect(add).toHaveBeenCalledWith(component.item, 2, [], 'sem cebola');
  });

  it('adicionar() envia undefined quando a observação está vazia', () => {
    const service = TestBed.inject(DeliveryService);
    const add = vi.spyOn(service, 'addItem').mockImplementation(() => {});
    component.item = { id: 3, nome: 'X', preco: 10, adicionais: [] } as never;
    component.observacao = '   ';
    component.adicionar();
    expect(add).toHaveBeenCalledWith(component.item, 1, [], undefined);
  });
});
