import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// A tipagem completa do SDK viria de @types/google.maps; aqui usamos `any` para
// não adicionar dependência (o SDK é carregado dinamicamente em runtime).
declare const google: any;

/**
 * Carrega o Google Maps JavaScript API sob demanda (uma única vez), com a
 * biblioteca `places`. A chave vem de `environment.googleMapsApiKey`.
 *
 * Sem chave, `load()` rejeita e a UI deve seguir funcionando sem mapa.
 */
@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private promise?: Promise<void>;

  /** Há chave configurada? A UI usa isto para exibir/omitir o mapa. */
  get disponivel(): boolean {
    return !!environment.googleMapsApiKey;
  }

  load(): Promise<void> {
    if (typeof google !== 'undefined' && google?.maps?.places) {
      return Promise.resolve();
    }
    if (this.promise) {
      return this.promise;
    }
    if (!environment.googleMapsApiKey) {
      return Promise.reject(new Error('Chave do Google Maps não configurada.'));
    }

    this.promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      const key = encodeURIComponent(environment.googleMapsApiKey);
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=pt-BR`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.promise = undefined; // permite nova tentativa
        reject(new Error('Falha ao carregar o Google Maps.'));
      };
      document.head.appendChild(script);
    });
    return this.promise;
  }
}
