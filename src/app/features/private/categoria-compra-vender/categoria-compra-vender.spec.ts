import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaCompraVender } from './categoria-compra-vender';

describe('CategoriaCompraVender', () => {
  let component: CategoriaCompraVender;
  let fixture: ComponentFixture<CategoriaCompraVender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaCompraVender],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaCompraVender);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
