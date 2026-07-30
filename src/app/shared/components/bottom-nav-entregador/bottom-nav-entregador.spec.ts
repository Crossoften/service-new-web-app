import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavEntregador } from './bottom-nav-entregador';

describe('BottomNavEntregador', () => {
  let component: BottomNavEntregador;
  let fixture: ComponentFixture<BottomNavEntregador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavEntregador],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavEntregador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
