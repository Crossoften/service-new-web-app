import { TestBed } from '@angular/core/testing';

import { FornecedorServicos } from './fornecedor-servicos';

describe('FornecedorServicos', () => {
  let service: FornecedorServicos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FornecedorServicos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
