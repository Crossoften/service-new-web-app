import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesPedidoFornecedor } from './detalhes-pedido-fornecedor';

describe('DetalhesPedidoFornecedor', () => {
  let component: DetalhesPedidoFornecedor;
  let fixture: ComponentFixture<DetalhesPedidoFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesPedidoFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesPedidoFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
