import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { BottomNavFornecedorComponent } from './bottom-nav-fornecedor';

describe('BottomNavFornecedorComponent', () => {
  let component: BottomNavFornecedorComponent;
  let fixture: ComponentFixture<BottomNavFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavFornecedorComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavFornecedorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Categorias leva ao hub do fornecedor (/fornecedor)', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.navegar('categorias');
    expect(nav).toHaveBeenCalledWith(['/fornecedor']);
  });

  it('Restaurante leva a /fornecedor/restaurante', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.navegar('restaurante');
    expect(nav).toHaveBeenCalledWith(['/fornecedor/restaurante']);
  });
});
