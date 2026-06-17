import { TestBed } from '@angular/core/testing';

import { Fornecedor } from './fornecedor';

describe('Fornecedor', () => {
  let service: Fornecedor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fornecedor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
