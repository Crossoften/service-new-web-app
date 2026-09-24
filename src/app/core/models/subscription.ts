import { SubscriptionStatus } from './enums';
import { ResponsePlanDto } from './plan';

/**
 * Corpo de `POST /v1/subscriptions` (CreateSubscriptionDto).
 *
 * Contrato novo (assinatura por categoria): o pagamento passou a ser via
 * checkout externo do Mercado Pago — a resposta traz `checkoutUrl` e o Front
 * redireciona o browser. Por isso **não há mais** campos de cartão/`method`:
 * o que o back exige agora é `planId` + `categoryId`. `payerEmail`/endereço são
 * opcionais (o back usa o e-mail da conta quando omitido).
 */
export interface CreateSubscriptionDto {
  planId: number;
  categoryId: number;
  payerEmail?: string;
  billingStreet?: string;
  billingNeighborhood?: string;
  billingCity?: string;
  billingState?: string;
  billingZipCode?: string;
}

/** Categoria vinculada à assinatura (ResponseSubscriptionCategoryDto). */
export interface ResponseSubscriptionCategoryDto {
  id: number;
  name: string;
  slug: string;
}

/** Pagamento da assinatura (ResponseSubscriptionPaymentDto). */
export interface ResponseSubscriptionPaymentDto {
  id: number;
  method: string;
  status: string;
  amount: string;
  holderName?: string;
  cardBrand?: string;
  cardLast4?: string;
  paidAt?: string;
}

/**
 * Assinatura retornada pela API (ResponseSubscriptionDto).
 * Os campos derivados (`cancelAtPeriodEnd`, `needsRenewal`, `inGracePeriod`,
 * `expired`, `daysUntilExpiration`) definem o status exibido — ver a tela de
 * gestão da assinatura.
 */
export interface ResponseSubscriptionDto {
  id: number;
  status: SubscriptionStatus;
  amount: string;
  planName: string;
  planInterval: string;
  intervalCount: number;
  plan: ResponsePlanDto;
  category?: ResponseSubscriptionCategoryDto;
  payment?: ResponseSubscriptionPaymentDto;
  startedAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  daysUntilExpiration?: number;
  needsRenewal: boolean;
  inGracePeriod: boolean;
  expired: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Retorno de `POST /v1/subscriptions` e `POST /v1/subscriptions/:id/renew`
 * (CreateSubscriptionResponseDto). `checkoutUrl` é o link do Mercado Pago para
 * onde o Front redireciona o browser concluir o pagamento.
 */
export interface CreateSubscriptionResponseDto {
  message: string;
  checkoutUrl: string;
  subscription: ResponseSubscriptionDto;
}

/** Resumo da assinatura de uma categoria no catálogo (ResponseCatalogSubscriptionDto). */
export interface ResponseCatalogSubscriptionDto {
  id: number;
  planName: string;
  currentPeriodEnd?: string;
  daysUntilExpiration?: number;
  needsRenewal: boolean;
  inGracePeriod: boolean;
  expired: boolean;
  cancelAtPeriodEnd: boolean;
  coversAllCategories: boolean;
}

/** Categoria assinável no catálogo (ResponseCatalogCategoryDto). */
export interface ResponseCatalogCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  isSubscribed: boolean;
  subscription?: ResponseCatalogSubscriptionDto;
}

/** Retorno de `GET /v1/subscriptions/catalog` (ResponseSubscriptionCatalogDto). */
export interface ResponseSubscriptionCatalogDto {
  plans: ResponsePlanDto[];
  categories: ResponseCatalogCategoryDto[];
  subscribedCount: number;
}
