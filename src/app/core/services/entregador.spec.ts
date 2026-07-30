import { TestBed } from '@angular/core/testing';

import { Entregador } from './entregador';

describe('Entregador', () => {
  let service: Entregador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Entregador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
