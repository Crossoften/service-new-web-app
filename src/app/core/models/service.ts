import { ServiceType } from './enums';

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

/** Serviço completo — `GET /v1/services/{id}` (ResponseServiceDto). */
export interface ServiceDto extends ServiceListItemDto {
  registrationCode?: string;
  imageKey?: string;
  categoryId: number;
  category: ServiceCategoryDto;
  userId: number;
  user: ServiceOwnerDto;
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
