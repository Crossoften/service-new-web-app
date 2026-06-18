import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListagemServicosFornecedor } from './listagem-servicos-fornecedor';

describe('ListagemServicosFornecedor', () => {
  let component: ListagemServicosFornecedor;
  let fixture: ComponentFixture<ListagemServicosFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemServicosFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemServicosFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
