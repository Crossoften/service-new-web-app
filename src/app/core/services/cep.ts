import { Injectable } from '@angular/core';

/** Endereço retornado pela consulta de CEP (campos que o ViaCEP fornece). */
export interface EnderecoCep {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Consulta de CEP (ViaCEP — API pública brasileira).
 *
 * Usa `fetch` direto, **não** o `ApiService`/`HttpClient`: é um host externo
 * (`viacep.com.br`) e não deve receber o `Authorization: Bearer` do nosso
 * interceptor (vazaria o token e dispararia preflight desnecessário). Mesmo
 * motivo do passo S3 do upload (§8.14).
 */
@Injectable({ providedIn: 'root' })
export class CepService {
  /**
   * Busca o endereço de um CEP. Retorna `null` quando o CEP é incompleto
   * (≠ 8 dígitos) ou não existe (`{ erro: true }` do ViaCEP); lança em falha de
   * rede/indisponibilidade para a tela tratar.
   */
  async buscar(cep: string): Promise<EnderecoCep | null> {
    const digitos = (cep ?? '').replace(/\D/g, '');
    if (digitos.length !== 8) return null;

    const resp = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    if (!resp.ok) throw new Error('Falha ao consultar o CEP.');

    const data = await resp.json();
    if (!data || data.erro) return null;

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  }
}
