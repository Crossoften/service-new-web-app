/** Status da reserva (`/bookings`). */
export type BookingStatus =
  | 'Requested'
  | 'Confirmed'
  | 'Rejected'
  | 'CheckedIn'
  | 'Completed'
  | 'Cancelled';

export type BookingParticipantRole = 'Requester' | 'Provider' | 'All';

export interface BookingAccommodationDto {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface BookingUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Reserva — `GET /v1/bookings/{id}` (ResponseBookingDto). `totalValue` é string. */
export interface BookingDto {
  id: number;
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalValue: string;
  cancelReason?: string;
  chatRoomId: number;
  accommodation: BookingAccommodationDto;
  requester: BookingUserDto;
  provider: BookingUserDto;
  confirmedAt?: string;
  rejectedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/bookings` (CreateBookingDto). */
export interface CreateBookingDto {
  accommodationId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalValue: number;
}

/** Corpo de `PATCH /v1/bookings/{id}/respond` (anfitrião). */
export interface RespondBookingDto {
  status: 'Confirmed' | 'Rejected';
}

/** Corpo de `PATCH /v1/bookings/{id}/cancel`. */
export interface CancelBookingDto {
  cancelReason?: string;
}

export interface BookingQuery {
  status?: BookingStatus;
  participantRole?: BookingParticipantRole;
  take?: number;
  skip?: number;
}
