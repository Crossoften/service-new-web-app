import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemDelivery } from './listagem-delivery';

describe('ListagemDelivery', () => {
  let component: ListagemDelivery;
  let fixture: ComponentFixture<ListagemDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemDelivery],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemDelivery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
