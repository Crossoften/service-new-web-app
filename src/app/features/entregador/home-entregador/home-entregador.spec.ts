import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeEntregador } from './home-entregador';

describe('HomeEntregador', () => {
  let component: HomeEntregador;
  let fixture: ComponentFixture<HomeEntregador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEntregador],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEntregador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
