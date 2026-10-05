import { TestBed } from '@angular/core/testing';

import { FornecedorServicosService } from './fornecedor-servicos';

describe('FornecedorServicosService', () => {
  let service: FornecedorServicosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FornecedorServicosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
