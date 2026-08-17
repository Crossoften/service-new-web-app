/** Status do pedido de transporte (`/transport-requests`). */
export type TransportRequestStatus =
  | 'Requested'
  | 'Quoted'
  | 'Accepted'
  | 'Rejected'
  | 'InTransit'
  | 'Delivered'
  | 'Cancelled';

export type TransportParticipantRole = 'Requester' | 'Provider' | 'All';

export interface TransportRequestTransportationDto {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface TransportRequestUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Pedido de transporte — `GET /v1/transport-requests/{id}` (ResponseTransportRequestDto). */
export interface TransportRequestDto {
  id: number;
  status: TransportRequestStatus;
  origin: string;
  destination: string;
  cargoDescription?: string;
  quotedValue?: string;
  cancelReason?: string;
  chatRoomId: number;
  transportation: TransportRequestTransportationDto;
  requester: TransportRequestUserDto;
  provider: TransportRequestUserDto;
  quotedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/transport-requests` (CreateTransportRequestDto). */
export interface CreateTransportRequestDto {
  transportationId: number;
  origin: string;
  destination: string;
  cargoDescription?: string;
}

/** Corpo de `PATCH /v1/transport-requests/{id}/quote` (transportador). */
export interface QuoteTransportRequestDto {
  quotedValue: number;
}

/** Corpo de `PATCH /v1/transport-requests/{id}/respond` (solicitante). */
export interface RespondTransportRequestDto {
  status: 'Accepted' | 'Rejected';
}

/** Corpo de `PATCH /v1/transport-requests/{id}/cancel`. */
export interface CancelTransportRequestDto {
  cancelReason?: string;
}

/** Filtros de `GET /v1/transport-requests`. */
export interface TransportRequestQuery {
  status?: TransportRequestStatus;
  participantRole?: TransportParticipantRole;
  take?: number;
  skip?: number;
}
