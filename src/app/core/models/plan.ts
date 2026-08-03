import { PlanInterval } from './enums';

/**
 * Plano de assinatura ativo (ResponsePlanDto do Swagger).
 * Observação: `price` e `monthlyPrice` chegam como **string** (ex.: "39.90").
 */
export interface ResponsePlanDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  interval: PlanInterval;
  intervalCount: number;
  bonusMonths: number;
  monthlyPrice: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryId?: number;
}

/** Retorno paginado de `GET /v1/plans/active` (ResponseFindAllPlansDto). */
export interface ResponseFindAllPlansDto {
  plans: ResponsePlanDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}
