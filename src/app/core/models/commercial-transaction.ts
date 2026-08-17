import { CommercialTransactionStatus, PaymentMethod, PaymentStatus } from './enums';

/** Referência negociável (hoje só produto). */
export type CommercialReferenceType = 'Product';

/** Papel do participante no filtro de listagem. */
export type CommercialParticipantRole = 'Buyer' | 'Seller' | 'All';

export interface CommercialTransactionUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

export interface CommercialTransactionProductDto {
  id: number;
  name: string;
  model?: string;
  price: string;
  imageUrl?: string;
}

export interface CommercialTransactionPaymentDto {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  holderName?: string;
  cardBrand?: string;
  cardLast4?: string;
  paidAt?: string;
}

/** Negociação — `GET /v1/commercial-transactions/{id}` (ResponseCommercialTransactionDto). */
export interface CommercialTransactionDto {
  id: number;
  referenceType: CommercialReferenceType;
  referenceId: number;
  status: CommercialTransactionStatus;
  title?: string;
  description?: string;
  requestedAmount: string;
  agreedAmount?: string;
  chatRoomId: number;
  buyer: CommercialTransactionUserDto;
  seller: CommercialTransactionUserDto;
  product?: CommercialTransactionProductDto;
  payment?: CommercialTransactionPaymentDto;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  paidAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/commercial-transactions` (CreateCommercialTransactionDto). */
export interface CreateCommercialTransactionDto {
  referenceType: CommercialReferenceType;
  referenceId: number;
  requestedAmount: number;
  title?: string;
  description?: string;
  fileName?: string;
  fileUrl?: string;
  fileKey?: string;
}

/** Corpo de `PATCH /v1/commercial-transactions/{id}/respond` (vendedor). */
export interface RespondCommercialTransactionDto {
  status: 'Accepted' | 'Rejected';
  agreedAmount?: number;
  message?: string;
}

/** Corpo de `POST /v1/commercial-transactions/{id}/pay` (comprador). */
export interface PayCommercialTransactionDto {
  method: PaymentMethod;
  holderName?: string;
  cardBrand?: string;
  cardNumber?: string;
}

/** Filtros de `GET /v1/commercial-transactions`. */
export interface CommercialTransactionQuery {
  status?: CommercialTransactionStatus;
  participantRole?: CommercialParticipantRole;
  search?: string;
  take?: number;
  skip?: number;
}
