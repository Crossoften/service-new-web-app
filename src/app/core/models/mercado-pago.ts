/** Vínculo do fornecedor com o Mercado Pago (`/mercado-pago`). */

/** `GET /v1/mercado-pago/status` (ResponseMercadoPagoStatusDto). */
export interface MercadoPagoStatusDto {
  isLinked: boolean;
  mpUserId?: string;
  linkedAt?: string;
}

/** `GET /v1/mercado-pago/connect-url` (ResponseConnectUrlDto). */
export interface ConnectUrlDto {
  url: string;
}

/** Corpo de `POST /v1/mercado-pago/oauth/callback` (OAuthCallbackDto). */
export interface OAuthCallbackDto {
  code: string;
  /** Precisa ser exatamente a mesma URI usada no connect-url. */
  redirectUri?: string;
}

/** Resposta de `POST /v1/mercado-pago/oauth/callback` (ResponseOAuthCallbackDto). */
export interface OAuthCallbackResponseDto {
  message: string;
  mpUserId: string;
}
