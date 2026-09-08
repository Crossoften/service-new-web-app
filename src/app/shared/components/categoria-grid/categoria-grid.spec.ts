import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaGridComponent, CategoriaItem } from './categoria-grid';

describe('CategoriaGridComponent', () => {
  let component: CategoriaGridComponent;
  let fixture: ComponentFixture<CategoriaGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('temIcone é falso sem URL e verdadeiro com URL', () => {
    expect(component.temIcone({ label: 'A', icon: '' })).toBe(false);
    expect(component.temIcone({ label: 'B', icon: 'https://cdn/x.png' })).toBe(true);
  });

  it('após erro de carregamento, cai no placeholder', () => {
    const item: CategoriaItem = { label: 'B', icon: 'https://cdn/x.png' };
    expect(component.temIcone(item)).toBe(true);
    component.marcarQuebrado(item);
    expect(component.temIcone(item)).toBe(false);
  });

  it('renderiza placeholder (svg) quando o ícone está quebrado', () => {
    component.items = [{ label: 'Lanches', icon: '' }];
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.categoria-grid__icon svg')).toBeTruthy();
    expect(el.querySelector('.categoria-grid__icon img')).toBeNull();
  });
});
