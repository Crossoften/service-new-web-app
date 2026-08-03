import { PaymentMethod, SubscriptionStatus } from './enums';

/**
 * Corpo de `POST /v1/subscriptions` (CreateSubscriptionDto).
 * Obrigatórios: `planId` e `method`. Demais campos (cartão/endereço) são opcionais.
 */
export interface CreateSubscriptionDto {
  planId: number;
  method: PaymentMethod;
  holderName?: string;
  cardBrand?: string;
  cardNumber?: string;
  billingStreet?: string;
  billingNeighborhood?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
}

/** Assinatura retornada pela API (subset usado no Front — ResponseSubscriptionDto). */
export interface ResponseSubscriptionDto {
  id: number;
  status: SubscriptionStatus;
  amount: string;
  planName: string;
  planInterval: string;
  intervalCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Retorno de `POST /v1/subscriptions` (CreateSubscriptionResponseDto). */
export interface CreateSubscriptionResponseDto {
  message: string;
  subscription: ResponseSubscriptionDto;
}
