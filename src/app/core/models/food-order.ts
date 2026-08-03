import { PaymentMethod } from './enums';

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

/** Corpo de `POST /v1/food-orders` (CreateFoodOrderDto). */
export interface CreateFoodOrderDto {
  restaurantId: number;
  paymentMethod: PaymentMethod;
  deliveryFee?: number;
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
