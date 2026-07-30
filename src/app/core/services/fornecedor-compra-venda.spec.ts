import { TestBed } from '@angular/core/testing';

import { FornecedorCompraVenda } from './fornecedor-compra-venda';

describe('FornecedorCompraVenda', () => {
  let service: FornecedorCompraVenda;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FornecedorCompraVenda);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
