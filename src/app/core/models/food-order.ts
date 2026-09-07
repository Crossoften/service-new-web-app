import { PaymentMethod, PaymentStatus } from './enums';

/** Rótulos em pt para os métodos de pagamento. */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CreditCard: 'Cartão de Crédito',
  DebitCard: 'Cartão de Débito',
  Pix: 'PIX',
  BankSlip: 'Boleto',
  Cash: 'Dinheiro',
};

/** Estados de um pedido de delivery (ResponseFoodOrderDto.status). */
export type FoodOrderStatus =
  | 'Received'
  | 'Accepted'
  | 'Preparing'
  | 'OnTheWay'
  | 'Delivered'
  | 'Cancelled';

// ── Criação de pedido ────────────────────────────────────────────────────────

export interface CreateFoodOrderItemDto {
  menuItemId: number;
  quantity: number;
  notes?: string;
  additionIds?: number[];
}

/**
 * Corpo de `POST /v1/food-orders` (CreateFoodOrderDto).
 * `deliveryFee` foi **removido** na Fase C — o frete é calculado no servidor pela
 * distância entre o restaurante e o endereço do cliente.
 */
export interface CreateFoodOrderDto {
  restaurantId: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: CreateFoodOrderItemDto[];
}

// ── Resposta / detalhe ───────────────────────────────────────────────────────

export interface ResponseFoodOrderRestaurantDto {
  id: number;
  name: string;
  imageUrl?: string;
  userId: number;
}

export interface ResponseFoodOrderUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

export interface ResponseFoodOrderItemDto {
  id: number;
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: string;
  notes?: string;
  additions: unknown[];
}

/** Rastreio do entregador (polling de lat/lng). */
export interface ResponseFoodOrderDeliveryDto {
  id: number;
  status: string;
  courierId?: number;
  currentLat?: string;
  currentLng?: string;
  locationUpdatedAt?: string;
}

export interface ResponseFoodOrderDto {
  id: number;
  status: FoodOrderStatus;
  itemsValue: string;
  deliveryFee: string;
  totalValue: string;
  platformFeeRate?: string;
  commissionAmount?: string;
  paymentMethod: PaymentMethod;
  /** `Pending` até o provedor (ou o confirm-payment do Cash). */
  paymentStatus?: PaymentStatus;
  notes?: string;
  cancelReason?: string;
  chatRoomId: number;
  restaurant: ResponseFoodOrderRestaurantDto;
  customer: ResponseFoodOrderUserDto;
  items: ResponseFoodOrderItemDto[];
  delivery?: ResponseFoodOrderDeliveryDto;
  acceptedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Retorno de `POST /v1/food-orders`. */
export interface CreateFoodOrderResponseDto {
  message: string;
  foodOrder: ResponseFoodOrderDto;
}

/** Retorno de `POST /v1/food-orders/{id}/pay` (checkout Mercado Pago). */
export interface PayFoodOrderResponseDto {
  message: string;
  checkoutUrl: string;
  foodOrder: ResponseFoodOrderDto;
}

/** Retorno paginado de `GET /v1/food-orders`. */
export interface ResponseFindAllFoodOrderDto {
  foodOrders: ResponseFoodOrderDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** Corpo de `PATCH /v1/food-orders/{id}/cancel`. */
export interface CancelFoodOrderDto {
  cancelReason: string;
}
