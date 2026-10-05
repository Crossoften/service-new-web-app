import { TestBed } from '@angular/core/testing';

import { GoogleMapsLoaderService } from './google-maps-loader';
import { environment } from '../../../environments/environment';

describe('GoogleMapsLoaderService', () => {
  let service: GoogleMapsLoaderService;
  let chaveOriginal: string;

  beforeEach(() => {
    // Estes casos validam o caminho "sem chave"; o ambiente de dev traz uma
    // chave real, então zeramos aqui e restauramos no afterEach.
    chaveOriginal = environment.googleMapsApiKey;
    environment.googleMapsApiKey = '';
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleMapsLoaderService);
  });

  afterEach(() => {
    environment.googleMapsApiKey = chaveOriginal;
  });

  it('disponivel = false quando não há chave configurada', () => {
    expect(service.disponivel).toBe(false);
  });

  it('load() rejeita quando não há chave', async () => {
    await expect(service.load()).rejects.toThrow('Chave do Google Maps');
  });
});
