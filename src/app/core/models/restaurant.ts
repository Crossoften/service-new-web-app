/**
 * DTOs de restaurante/cardápio (domínio Delivery), espelhando o Swagger.
 * Observação: valores monetários (`price`) chegam como **string**.
 *
 * Campos marcados como (BE-D1) ainda **não** são retornados pela API — foram
 * declarados opcionais para "ligar" automaticamente quando o back-end os incluir
 * (avaliação, tempo estimado, logo e taxa fixa do restaurante).
 */

export interface ResponseRestaurantCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
}

export interface ResponseMenuItemAdditionDto {
  id: number;
  name: string;
  price: string;
  isActive: boolean;
}

export interface ResponseMenuItemDto {
  id: number;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isActive: boolean;
  menuCategoryId: number;
  additions?: ResponseMenuItemAdditionDto[];
}

export interface ResponseMenuCategoryDto {
  id: number;
  name: string;
  sortOrder: number;
  items?: ResponseMenuItemDto[];
}

export interface ResponseRestaurantDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isOpen: boolean;
  category: ResponseRestaurantCategoryDto;
  userId: number;
  menuCategories?: ResponseMenuCategoryDto[];
  createdAt: string;
  updatedAt: string;
  /** Média das avaliações — ausente quando ninguém avaliou (Fase C). */
  ratingAverage?: number;
  /** Total de avaliações recebidas (0 quando não há). */
  ratingCount?: number;
  // (BE-D1) ainda não retornados pela API:
  rating?: number;
  estimatedTime?: string;
  logoUrl?: string;
  deliveryFee?: number;
}

/** Corpo de `POST /v1/restaurants/{id}/reviews` (CreateReviewDto). */
export interface CreateRestaurantReviewDto {
  /** Inteiro de 1 a 5. */
  rating: number;
  /** Comentário opcional (até 2000 caracteres). */
  comment?: string;
}

/** Resposta de `DELETE /v1/restaurants/menu-items/{id}`. */
export interface DeleteMenuItemResponseDto {
  /** `true` = apagado de vez; `false` = desativado (item já usado em pedidos). */
  deleted: boolean;
  message?: string;
}

export interface ResponseFindAllRestaurantDto {
  restaurants: ResponseRestaurantDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

// ── Administração (fornecedor) ───────────────────────────────────────────────
// Observação: nos DTOs de criação/edição, `price` é **number** (na resposta é string).

export interface CreateRestaurantDto {
  name: string;
  categoryId: number;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
}

export interface UpdateRestaurantDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  categoryId?: number;
  isOpen?: boolean;
  isActive?: boolean;
}

export interface CreateRestaurantResponseDto {
  message: string;
  restaurant: ResponseRestaurantDto;
}

export interface CreateMenuCategoryDto {
  name: string;
  sortOrder?: number;
}

export interface UpdateMenuCategoryDto {
  name?: string;
  sortOrder?: number;
}

export interface CreateMenuItemDto {
  name: string;
  price: number;
  menuCategoryId: number;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  imageKey?: string;
  menuCategoryId?: number;
  isActive?: boolean;
}

/** Payout/repasse do restaurante — `GET /v1/restaurants/me/payouts`. */
export interface ResponseRestaurantPayoutDto {
  billingType: string;
  commissionRate?: string;
  totalOrders: number;
  totalItemsValue: string;
  totalCommission: string;
  netAmount: string;
}
