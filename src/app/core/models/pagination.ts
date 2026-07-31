/**
 * Contrato de paginação padrão da API.
 *
 * Query params: take (qtd por página) + skip (página, 1-based) + search + sortBy + sortDirection.
 * Respostas paginadas retornam { <chave da lista>, currentPage, totalPages, totalRecords }.
 * A chave da lista varia por endpoint (services, works, budgets, products…), por isso
 * o `Page<T>` normaliza os itens em `items` no service de cada módulo.
 */

export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  take?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
}

/** Metadados presentes em toda resposta paginada. */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

/** Página normalizada, com os itens sempre em `items`. */
export interface Page<T> extends PaginationMeta {
  items: T[];
}
