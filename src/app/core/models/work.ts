import {
  WorkStatus,
  WorkScope,
  WorkFileType,
  ExtraRequestStatus,
  WarrantyRequestStatus,
  PaymentMethod,
  PaymentStatus,
} from './enums';

export interface WorkUserDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  fileUrl?: string;
}

export interface WorkServiceSummaryDto {
  id: number;
  name: string;
}

export interface WorkChatSummaryDto {
  id: number;
}

export interface WorkBudgetSummaryDto {
  id: number;
}

export interface WorkFileDto {
  id: number;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  type: WorkFileType;
  createdAt: string;
  updatedAt: string;
}

/** Anexo enviado ao criar/finalizar/solicitar garantia (CreateWorkFileDto). */
export interface CreateWorkFileDto {
  fileName: string;
  fileUrl: string;
  fileKey: string;
}

export interface WorkPaymentDto {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  holderName?: string;
  cardBrand?: string;
  cardLast4?: string;
}

/** Trabalho completo — `GET /v1/works/{id}` (ResponseWorkDto). Valores monetários = string. */
export interface WorkDto {
  id: number;
  status: WorkStatus;
  details?: string;
  completionDescription?: string;
  cancelReason?: string;
  serviceDate?: string;
  startedAt?: string;
  arrivalConfirmedAt?: string;
  finishedAt?: string;
  cancelledAt?: string;
  warrantyExpiresAt?: string;
  warrantyRequestedAt?: string;
  warrantyRequestDescription?: string;
  warrantyResponseDescription?: string;
  warrantyRespondedAt?: string;
  warrantyRequestStatus?: WarrantyRequestStatus;
  extraRequestValue?: string;
  extraRequestDescription?: string;
  extraRequestStatus?: ExtraRequestStatus;
  extraRequestedAt?: string;
  extraRespondedAt?: string;
  isUnderWarranty: boolean;
  chat?: WorkChatSummaryDto;
  serviceValue?: string;
  totalValue?: string;
  budgetId: number;
  budget: WorkBudgetSummaryDto;
  serviceId: number;
  service: WorkServiceSummaryDto;
  requesterId: number;
  requester: WorkUserDto;
  providerId: number;
  provider: WorkUserDto;
  files: WorkFileDto[];
  createdAt: string;
  updatedAt: string;
  payment?: WorkPaymentDto;
}

/** Item da listagem — `GET /v1/works` (ResponseWorkListItemDto). */
export interface WorkListItemDto {
  id: number;
  status: WorkStatus;
  serviceDate?: string;
  startedAt?: string;
  arrivalConfirmedAt?: string;
  finishedAt?: string;
  cancelledAt?: string;
  warrantyExpiresAt?: string;
  isUnderWarranty: boolean;
  warrantyRequestStatus?: WarrantyRequestStatus;
  warrantyRequestedAt?: string;
  extraRequestStatus?: ExtraRequestStatus;
  chat?: WorkChatSummaryDto;
  serviceValue?: string;
  totalValue?: string;
  budget: WorkBudgetSummaryDto;
  service: WorkServiceSummaryDto;
  requester: Pick<WorkUserDto, 'id' | 'name' | 'fileUrl'>;
  provider: Pick<WorkUserDto, 'id' | 'name' | 'fileUrl'>;
  createdAt: string;
  payment?: WorkPaymentDto;
}

/** Corpo de `POST /v1/works` (CreateWorkDto). Valores monetários = number. */
export interface CreateWorkDto {
  budgetId: number;
  details?: string;
  serviceDate?: string;
  warrantyExpiresAt?: string;
  serviceValue?: number;
  totalValue?: number;
  providerFiles?: CreateWorkFileDto[];
}

/** Corpo de `PATCH /v1/works/{id}/finish` (FinishWorkDto). */
export interface FinishWorkDto {
  completionDescription: string;
  serviceDate?: string;
  serviceValue?: number;
  totalValue?: number;
  warrantyExpiresAt?: string;
  completionFiles?: CreateWorkFileDto[];
}

/** Corpo de `POST /v1/works/{id}/pay` (PayWorkDto). */
export interface PayWorkDto {
  method: PaymentMethod;
  holderName?: string;
  cardBrand?: string;
  cardNumber?: string;
}

/** Corpo de `POST /v1/works/{id}/request-warranty` (RequestWorkWarrantyDto) — cliente. */
export interface RequestWorkWarrantyDto {
  description: string;
  files?: CreateWorkFileDto[];
}

/** Corpo de `PATCH /v1/works/{id}/respond-warranty` (RespondWorkWarrantyDto) — fornecedor. */
export interface RespondWorkWarrantyDto {
  status: 'Approved' | 'Rejected';
  description?: string;
}

/** Corpo de `PATCH /v1/works/{id}/request-extra` (RequestWorkExtraDto) — fornecedor. */
export interface RequestWorkExtraDto {
  description: string;
  value: number;
}

/** Corpo de `PATCH /v1/works/{id}/respond-extra` (RespondWorkExtraDto) — cliente. */
export interface RespondWorkExtraDto {
  status: 'Approved' | 'Rejected';
}

/** Corpo de `PATCH /v1/works/{id}/cancel` (CancelWorkDto). */
export interface CancelWorkDto {
  cancelReason: string;
}

export interface WorkQuery {
  scope?: WorkScope;
  status?: WorkStatus;
  serviceId?: number;
  search?: string;
  take?: number;
  skip?: number;
}
