import { ReviewType, ServiceType } from './enums';
import { ResponseWarrantyStatsDto } from './warranty-stats';

export interface ServiceCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  iconKey?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOwnerDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface ServiceListCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
}

/**
 * Item da listagem — `GET /v1/services` (ResponseServiceListItemDto). `price` é
 * string e **pode vir ausente** (serviço sob orçamento; §8.8).
 */
export interface ServiceListItemDto {
  id: number;
  name: string;
  type: ServiceType;
  price?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  category: ServiceListCategoryDto;
  user: ServiceOwnerDto;
  positiveReviews: number;
  negativeReviews: number;
  completedWorks: number;
}

/** Imagem da galeria do serviço — resposta (ServiceImageDto, BE-SRV-MEDIA-1). */
export interface ServiceImageDto {
  id: number;
  fileUrl: string;
  fileKey: string;
  sortOrder: number;
}

/** Imagem da galeria no envio (ServiceImageInputDto). `sortOrder` opcional — vale a ordem do array. */
export interface ServiceImageInputDto {
  fileUrl: string;
  fileKey: string;
  sortOrder?: number;
}

/** Serviço completo — `GET /v1/services/{id}` (ResponseServiceDto). */
export interface ServiceDto extends ServiceListItemDto {
  registrationCode?: string;
  imageKey?: string;
  /** Vídeo do serviço (BE-SRV-MEDIA-1). */
  videoUrl?: string;
  videoKey?: string;
  /** Galeria (até 10) — **só no detalhe**; a listagem traz apenas a capa. Nunca `null`. */
  images?: ServiceImageDto[];
  categoryId: number;
  category: ServiceCategoryDto;
  userId: number;
  user: ServiceOwnerDto;
  /** Contadores de garantia do prestador (BE-W7) — só no detalhe, não na listagem. */
  providerWarranties?: ResponseWarrantyStatsDto;
  createdAt: string;
  updatedAt: string;
}

/**
 * Corpo de `POST /v1/services` (CreateServiceDto). `price` é number e **opcional**
 * — sem `price` o serviço fica 100% sob orçamento (§8.8).
 */
export interface CreateServiceDto {
  name: string;
  type: ServiceType;
  registrationCode?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  /** Vídeo do serviço (BE-SRV-MEDIA-1). */
  videoUrl?: string;
  videoKey?: string;
  /** Galeria (até 10). O PATCH **substitui** a lista — mande sempre a final. */
  images?: ServiceImageInputDto[];
  categoryId: number;
  isActive?: boolean;
}

/**
 * Corpo de `PATCH /v1/services/{id}`. Campo ausente = não mexe; `price: null`
 * **apaga** o preço de um serviço que já tinha (§8.8).
 */
export type UpdateServiceDto = Partial<Omit<CreateServiceDto, 'price'>> & {
  price?: number | null;
};

export interface ServiceQuery {
  search?: string;
  name?: string;
  categoryId?: number;
  type?: ServiceType;
  userId?: number;
  isActive?: boolean;
  take?: number;
  skip?: number;
}

/** Corpo de `POST /v1/services/{id}/reviews` (CreateServiceReviewDto) — cliente. */
export interface CreateServiceReviewDto {
  type: ReviewType;
  comment?: string;
}
