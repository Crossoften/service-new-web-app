/** Status do aluguel (`/rentals`). */
export type RentalStatus =
  | 'Requested'
  | 'Accepted'
  | 'Rejected'
  | 'Active'
  | 'Returned'
  | 'Cancelled';

/** Papel no filtro de listagem de aluguéis. */
export type RentalParticipantRole = 'Requester' | 'Provider' | 'All';

export interface RentalProductDto {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface RentalUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Aluguel — `GET /v1/rentals/{id}` (ResponseRentalDto). `price` é string. */
export interface RentalDto {
  id: number;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  price: string;
  conditions?: string;
  cancelReason?: string;
  chatRoomId: number;
  product: RentalProductDto;
  requester: RentalUserDto;
  provider: RentalUserDto;
  acceptedAt?: string;
  rejectedAt?: string;
  returnedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/rentals` (CreateRentalDto). `price` é number. */
export interface CreateRentalDto {
  productId: number;
  startDate: string;
  endDate: string;
  price: number;
  conditions?: string;
}

/** Corpo de `PATCH /v1/rentals/{id}/respond` (locador). */
export interface RespondRentalDto {
  status: 'Accepted' | 'Rejected';
}

/** Corpo de `PATCH /v1/rentals/{id}/cancel`. */
export interface CancelRentalDto {
  cancelReason?: string;
}

/** Filtros de `GET /v1/rentals`. */
export interface RentalQuery {
  status?: RentalStatus;
  participantRole?: RentalParticipantRole;
  take?: number;
  skip?: number;
}
