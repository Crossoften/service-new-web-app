import { ResponseFoodOrderDto } from './food-order';

/** Estados de uma entrega (courier) — ResponseDeliveryDto.status. */
export type DeliveryStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'PickedUp'
  | 'OnTheWay'
  | 'Delivered'
  | 'Cancelled';

/** Entrega do domínio do entregador — `GET /v1/deliveries/*` (ResponseDeliveryDto). */
export interface ResponseDeliveryDto {
  id: number;
  status: DeliveryStatus;
  courierId?: number;
  currentLat?: string;
  currentLng?: string;
  locationUpdatedAt?: string;
  foodOrder: ResponseFoodOrderDto;
  acceptedAt?: string;
  rejectedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Retorno paginado de `GET /v1/deliveries/available` e `/deliveries/me`. */
export interface ResponseFindAllDeliveryDto {
  deliveries: ResponseDeliveryDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** Corpo de `PATCH /v1/deliveries/{id}/location`. */
export interface UpdateDeliveryLocationDto {
  lat: number;
  lng: number;
}
