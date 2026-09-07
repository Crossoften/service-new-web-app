import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  ConnectUrlDto,
  MercadoPagoStatusDto,
  OAuthCallbackDto,
  OAuthCallbackResponseDto,
} from '../models/mercado-pago';

/**
 * Vínculo do fornecedor com o Mercado Pago (OAuth).
 * O fornecedor conecta a própria conta; a plataforma intermedia e retém a comissão.
 * Nenhum token do vendedor trafega pelo front — a API grava cifrado e devolve só o id público.
 */
@Injectable({ providedIn: 'root' })
export class MercadoPagoService {
  private readonly api = inject(ApiService);

  /** Rota de retorno do OAuth, dentro do app. Deve ser idêntica no connect-url e no callback. */
  redirectUri(): string {
    return `${window.location.origin}/fornecedor/mercado-pago/callback`;
  }

  /** Situação do vínculo — `GET /v1/mercado-pago/status`. */
  status(): Observable<MercadoPagoStatusDto> {
    return this.api.get<MercadoPagoStatusDto>('/mercado-pago/status');
  }

  /** URL do Mercado Pago para o vendedor autorizar — `GET /v1/mercado-pago/connect-url`. */
  connectUrl(redirectUri?: string): Observable<ConnectUrlDto> {
    return this.api.get<ConnectUrlDto>('/mercado-pago/connect-url', { redirectUri });
  }

  /** Troca o `code` da autorização pelo vínculo — `POST /v1/mercado-pago/oauth/callback`. */
  vincular(dto: OAuthCallbackDto): Observable<OAuthCallbackResponseDto> {
    return this.api.post<OAuthCallbackResponseDto>('/mercado-pago/oauth/callback', dto);
  }
}
