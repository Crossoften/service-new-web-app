/**
 * Cupons de desconto no delivery (§8.9).
 *
 * Só existe a rota pública de **pré-visualização** (`POST /v1/coupons/validate`);
 * criar/editar cupom é exclusivo do admin (`/v1/admin-coupons`).
 */

/** Tipo do cupom. O contrato hoje expõe `Percent`; os demais entram como string. */
export type CouponType = 'Percent' | 'Fixed' | 'FreeShipping' | string;

/** Corpo de `POST /v1/coupons/validate`. */
export interface ValidateCouponDto {
  code: string;
  restaurantId: number;
  itemsValue: number;
}

/**
 * Resposta do `validate` — **apenas prévia**. O desconto NÃO é aceito como
 * entrada na criação do pedido: o back recalcula tudo a partir dos preços reais
 * do cardápio, e o que vale é o do pedido (§8.9).
 */
export interface ResponseCouponValidateDto {
  code: string;
  type: CouponType;
  /** Desconto estimado, em reais (string monetária). */
  discount: string;
  description?: string;
}
