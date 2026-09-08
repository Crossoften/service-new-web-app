import { TestBed } from '@angular/core/testing';

import { GoogleMapsLoaderService } from './google-maps-loader';

describe('GoogleMapsLoaderService', () => {
  let service: GoogleMapsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapsLoaderService);
  });

  it('disponivel = false quando não há chave configurada', () => {
    expect(service.disponivel).toBe(false);
  });

  it('load() rejeita quando não há chave', async () => {
    await expect(service.load()).rejects.toThrow('Chave do Google Maps');
  });
});
