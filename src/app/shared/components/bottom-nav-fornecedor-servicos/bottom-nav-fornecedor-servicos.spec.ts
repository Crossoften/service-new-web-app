import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { BottomNavFornecedorServicosComponent } from './bottom-nav-fornecedor-servicos';

describe('BottomNavFornecedorServicosComponent', () => {
  let component: BottomNavFornecedorServicosComponent;
  let fixture: ComponentFixture<BottomNavFornecedorServicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavFornecedorServicosComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavFornecedorServicosComponent);
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
});
