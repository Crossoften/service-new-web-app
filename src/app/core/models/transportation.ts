/** Categoria de transporte — `GET /v1/transportations/categories`. */
export interface TransportationCategoryDto {
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

export interface TransportationOwnerDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface TransportationListCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
}

/** Item do catálogo — `GET /v1/transportations` (ResponseTransportationListItemDto). `price` é string. */
export interface TransportationListItemDto {
  id: number;
  name: string;
  model?: string;
  mileageKm?: number;
  capacity?: number;
  year?: number;
  price: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  category: TransportationListCategoryDto;
  user: TransportationOwnerDto;
  positiveReviews: number;
  negativeReviews: number;
}

/** Transporte completo — `GET /v1/transportations/{id}` (ResponseTransportationDto). */
export interface TransportationDto extends TransportationListItemDto {
  imageKey?: string;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/** Filtros de `GET /v1/transportations`. */
export interface TransportationQuery {
  search?: string;
  name?: string;
  categoryId?: number;
  userId?: number;
  isActive?: boolean;
  take?: number;
  skip?: number;
}
