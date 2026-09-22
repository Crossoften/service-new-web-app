/**
 * Notificações push (PWA, §8.10). O back já envia; o trabalho é do navegador.
 *
 * Rotas: `GET /v1/push/public-key` (pública), `POST /v1/push/subscriptions`,
 * `DELETE /v1/push/subscriptions`.
 */

/**
 * `GET /v1/push/public-key`. ⚠️ `publicKey` pode vir **`null`** (VAPID não
 * configurado no servidor) — nesse caso NÃO se pede permissão ao usuário.
 */
export interface ResponsePublicKeyDto {
  publicKey: string | null;
}

/** Corpo de `POST`/`DELETE /v1/push/subscriptions`. */
export interface PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
