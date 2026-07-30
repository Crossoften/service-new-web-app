import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemProdutos } from './listagem-produtos';

describe('ListagemProdutos', () => {
  let component: ListagemProdutos;
  let fixture: ComponentFixture<ListagemProdutos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemProdutos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemProdutos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
