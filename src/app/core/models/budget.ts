import { BudgetStatus, BudgetScope, BudgetTimeUnit, ExtraRequestStatus } from './enums';

export interface BudgetServiceSummaryDto {
  id: number;
  name: string;
}

export interface BudgetUserDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  fileUrl?: string;
}

export interface BudgetFileDto {
  id: number;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  type: 'Request' | 'InformationRequest';
  createdAt: string;
  updatedAt: string;
}

/** Anexo enviado ao criar/atualizar orçamento (CreateBudgetFileDto). */
export interface CreateBudgetFileDto {
  fileName: string;
  fileUrl: string;
  fileKey: string;
}

/** Orçamento — `GET /v1/budgets/{id}` (ResponseBudgetDto). Valores monetários = string. */
export interface BudgetDto {
  id: number;
  description?: string;
  status: BudgetStatus;
  responseDescription?: string;
  responseValue?: string;
  extraRequestValue?: string;
  extraRequestDescription?: string;
  extraRequestStatus?: ExtraRequestStatus;
  responseTimeQuantity?: number;
  responseTimeUnit?: BudgetTimeUnit;
  serviceId: number;
  service: BudgetServiceSummaryDto;
  requesterId: number;
  requester: BudgetUserDto;
  providerId: number;
  provider: BudgetUserDto;
  files: BudgetFileDto[];
  /** Preenchido quando o cliente aprovou (§8.8). */
  acceptedAt?: string;
  /** Preenchido quando o cliente recusou o preço (§8.8). */
  rejectedAt?: string;
  /** Motivo opcional informado na recusa (§8.8). */
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** Item da listagem — `GET /v1/budgets` (ResponseBudgetListItemDto). */
export interface BudgetListItemDto {
  id: number;
  description?: string;
  status: BudgetStatus;
  responseValue?: string;
  extraRequestStatus?: ExtraRequestStatus;
  responseTimeQuantity?: number;
  responseTimeUnit?: BudgetTimeUnit;
  service: BudgetServiceSummaryDto;
  requester: BudgetUserDto;
  provider: BudgetUserDto;
  createdAt: string;
}

/** Corpo de `POST /v1/budgets` (CreateBudgetDto). */
export interface CreateBudgetDto {
  serviceId: number;
  description?: string;
  files?: CreateBudgetFileDto[];
}

/** Corpo de `PATCH /v1/budgets/{id}` — resposta do fornecedor (UpdateBudgetDto). */
export interface UpdateBudgetDto {
  status?: BudgetStatus;
  responseDescription?: string;
  responseValue?: number;
  responseTimeQuantity?: number;
  responseTimeUnit?: BudgetTimeUnit;
  description?: string;
  files?: CreateBudgetFileDto[];
}

export interface RequestBudgetExtraDto {
  description: string;
  value: number;
}

export interface RespondBudgetExtraDto {
  status: 'Approved' | 'Rejected';
}

/** Corpo de `PATCH /v1/budgets/{id}/reject` — cliente recusa o preço (§8.8). */
export interface RejectBudgetDto {
  rejectReason?: string;
}

export interface RequestBudgetInformationDto {
  message: string;
  files?: CreateBudgetFileDto[];
}

export interface BudgetQuery {
  scope?: BudgetScope;
  status?: BudgetStatus;
  serviceId?: number;
  search?: string;
  take?: number;
  skip?: number;
}
