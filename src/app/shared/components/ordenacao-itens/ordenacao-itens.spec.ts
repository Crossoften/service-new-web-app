import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenacaoItensComponent } from './ordenacao-itens';

describe('OrdenacaoItensComponent', () => {
  let component: OrdenacaoItensComponent;
  let fixture: ComponentFixture<OrdenacaoItensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenacaoItensComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenacaoItensComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('label reflete o valor e selecionar atualiza + fecha', () => {
    expect(component.label).toBe('Relevância');
    component.toggle();
    expect(component.aberto).toBe(true);
    component.selecionar('preco-asc');
    expect(component.valor()).toBe('preco-asc');
    expect(component.label).toBe('Menor preço');
    expect(component.aberto).toBe(false);
  });
});
