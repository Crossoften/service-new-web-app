import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabalhosEntregador } from './trabalhos-entregador';

describe('TrabalhosEntregador', () => {
  let component: TrabalhosEntregador;
  let fixture: ComponentFixture<TrabalhosEntregador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabalhosEntregador],
    }).compileComponents();

    fixture = TestBed.createComponent(TrabalhosEntregador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
