export interface AccommodationCategoryDto {
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

export interface AccommodationOwnerDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface AccommodationListCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
}

/** Item da listagem — `GET /v1/accommodations`. `price` é string. */
export interface AccommodationListItemDto {
  id: number;
  name: string;
  city?: string;
  state?: string;
  roomsQuantity?: number;
  price: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  category: AccommodationListCategoryDto;
  user: AccommodationOwnerDto;
  positiveReviews: number;
  negativeReviews: number;
}

/** Hospedagem completa — `GET /v1/accommodations/{id}`. */
export interface AccommodationDto extends AccommodationListItemDto {
  street?: string;
  neighborhood?: string;
  imageKey?: string;
  categoryId: number;
  category: AccommodationCategoryDto;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccommodationQuery {
  search?: string;
  name?: string;
  city?: string;
  state?: string;
  categoryId?: number;
  userId?: number;
  isActive?: boolean;
  take?: number;
  skip?: number;
}

/** Corpo de `POST /v1/accommodations` (CreateAccommodationDto). `price` é number. */
export interface CreateAccommodationDto {
  categoryId: number;
  name: string;
  price: number;
  roomsQuantity?: number;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  isActive?: boolean;
}

/** Corpo de `PATCH /v1/accommodations/{id}` (UpdateAccommodationDto). */
export type UpdateAccommodationDto = Partial<CreateAccommodationDto>;
