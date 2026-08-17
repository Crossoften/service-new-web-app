import { ProductTransactionType } from './enums';

/** Categoria de produto — `GET /v1/products/categories` (ResponseProductCategoryDto). */
export interface ProductCategoryDto {
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

/** Dono do produto (resumido, na listagem). */
export interface ProductListOwnerDto {
  id: number;
  name: string;
  phone?: string;
}

/** Categoria resumida presente na listagem. */
export interface ProductListCategoryDto {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
}

/** Item da vitrine — `GET /v1/products` (ResponseProductListItemDto). `price` é string. */
export interface ProductListItemDto {
  id: number;
  name: string;
  transactionType: ProductTransactionType;
  model?: string;
  year?: number;
  price: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  category: ProductListCategoryDto;
  user: ProductListOwnerDto;
  positiveReviews: number;
  negativeReviews: number;
}

/** Dono do produto (detalhe). */
export interface ProductOwnerDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

/** Produto completo — `GET /v1/products/{id}` (ResponseProductDto). */
export interface ProductDto {
  id: number;
  name: string;
  transactionType: ProductTransactionType;
  model?: string;
  year?: number;
  price: string;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  isActive: boolean;
  categoryId: number;
  category: ProductCategoryDto;
  userId: number;
  user: ProductOwnerDto;
  positiveReviews: number;
  negativeReviews: number;
  createdAt: string;
  updatedAt: string;
}

/** Corpo de `POST /v1/products` (CreateProductDto). `price` é number. */
export interface CreateProductDto {
  categoryId: number;
  transactionType: ProductTransactionType;
  name: string;
  model?: string;
  year?: number;
  price: number;
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  isActive?: boolean;
}

/** Corpo de `PATCH /v1/products/{id}` (UpdateProductDto). Todos opcionais. */
export type UpdateProductDto = Partial<CreateProductDto>;

/** Filtros aceitos por `GET /v1/products` e `/my-products`. */
export interface ProductQuery {
  search?: string;
  name?: string;
  categoryId?: number;
  userId?: number;
  transactionType?: ProductTransactionType;
  isActive?: boolean;
  take?: number;
  skip?: number;
}
