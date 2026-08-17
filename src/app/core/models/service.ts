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

/** Item da listagem — `GET /v1/services` (ResponseServiceListItemDto). `price` é string. */
export interface ServiceListItemDto {
  id: number;
  name: string;
  type: ServiceType;
  price: string;
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

/** Corpo de `POST /v1/services` (CreateServiceDto). `price` é number. */
export interface CreateServiceDto {
  name: string;
  type: ServiceType;
  registrationCode?: string;
  price: number;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  categoryId: number;
  isActive?: boolean;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

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
