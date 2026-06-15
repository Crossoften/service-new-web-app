import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaDelivery } from './categoria-delivery';

describe('CategoriaDelivery', () => {
  let component: CategoriaDelivery;
  let fixture: ComponentFixture<CategoriaDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaDelivery],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaDelivery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
