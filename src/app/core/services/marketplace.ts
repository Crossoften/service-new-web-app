import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { ApiMessage } from '../models/common';
import { Page } from '../models/pagination';
import { ProductTransactionType } from '../models/enums';
import {
  CreateProductDto,
  ProductCategoryDto,
  ProductDto,
  ProductListItemDto,
  ProductQuery,
  UpdateProductDto,
} from '../models/product';
import {
  CommercialTransactionDto,
  CommercialTransactionQuery,
  CreateCommercialTransactionDto,
  PayCommercialTransactionDto,
  RespondCommercialTransactionDto,
} from '../models/commercial-transaction';
import { CommercialTransactionStatus } from '../models/enums';

/** Resposta paginada de `/products` (ResponseFindAllProductDto). */
interface ResponseFindAllProductDto {
  products: ProductListItemDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateProductResponseDto {
  message: string;
  product: ProductDto;
}

interface ResponseFindAllCommercialTransactionDto {
  transactions: CommercialTransactionDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateCommercialTransactionResponseDto {
  message: string;
  transaction: CommercialTransactionDto;
}

/**
 * Marketplace (Compra-Venda): catálogo de produtos e categorias.
 * A negociação (`/commercial-transactions`) fica em fatia posterior (M-2/M-4).
 */
@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly api = inject(ApiService);

  /** Vitrine pública de produtos ativos — `GET /v1/products`. */
  produtos(query: ProductQuery = {}): Observable<Page<ProductListItemDto>> {
    return this.api
      .get<ResponseFindAllProductDto>('/products', this.toParams(query))
      .pipe(map((r) => this.toPage(r)));
  }

  /** Produtos do usuário autenticado — `GET /v1/products/my-products`. */
  meusProdutos(query: ProductQuery = {}): Observable<Page<ProductListItemDto>> {
    return this.api
      .get<ResponseFindAllProductDto>('/products/my-products', this.toParams(query))
      .pipe(map((r) => this.toPage(r)));
  }

  /** Categorias de produto ativas — `GET /v1/products/categories`. */
  categorias(): Observable<ProductCategoryDto[]> {
    return this.api.get<ProductCategoryDto[]>('/products/categories');
  }

  /** Detalhe de um produto — `GET /v1/products/{id}`. */
  produto(id: number): Observable<ProductDto> {
    return this.api.get<ProductDto>(`/products/${id}`);
  }

  /** Cadastra um produto — `POST /v1/products`. */
  criar(dto: CreateProductDto): Observable<ProductDto> {
    return this.api.post<CreateProductResponseDto>('/products', dto).pipe(map((r) => r.product));
  }

  /** Edita um produto — `PATCH /v1/products/{id}`. */
  atualizar(id: number, dto: UpdateProductDto): Observable<ProductDto> {
    return this.api.patch<ProductDto>(`/products/${id}`, dto);
  }

  /** Remove um produto — `DELETE /v1/products/{id}`. */
  remover(id: number): Observable<ApiMessage> {
    return this.api.delete<ApiMessage>(`/products/${id}`);
  }

  // ── Negociações (commercial-transactions) ────────────────────────────────

  /** Abre uma negociação sobre um produto — `POST /v1/commercial-transactions`. */
  iniciarNegociacao(dto: CreateCommercialTransactionDto): Observable<CommercialTransactionDto> {
    return this.api
      .post<CreateCommercialTransactionResponseDto>('/commercial-transactions', dto)
      .pipe(map((r) => r.transaction));
  }

  /** Lista negociações do usuário — `GET /v1/commercial-transactions`. */
  negociacoes(query: CommercialTransactionQuery = {}): Observable<Page<CommercialTransactionDto>> {
    return this.api
      .get<ResponseFindAllCommercialTransactionDto>('/commercial-transactions', {
        status: query.status,
        participantRole: query.participantRole,
        search: query.search,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.transactions ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  /** Detalhe de uma negociação — `GET /v1/commercial-transactions/{id}`. */
  negociacao(id: number): Observable<CommercialTransactionDto> {
    return this.api.get<CommercialTransactionDto>(`/commercial-transactions/${id}`);
  }

  /** Vendedor aceita/rejeita — `PATCH /v1/commercial-transactions/{id}/respond`. */
  responder(id: number, dto: RespondCommercialTransactionDto): Observable<CommercialTransactionDto> {
    return this.api.patch<CommercialTransactionDto>(`/commercial-transactions/${id}/respond`, dto);
  }

  /** Comprador paga — `POST /v1/commercial-transactions/{id}/pay`. */
  pagar(id: number, dto: PayCommercialTransactionDto): Observable<CommercialTransactionDto> {
    return this.api.post<CommercialTransactionDto>(`/commercial-transactions/${id}/pay`, dto);
  }

  /** Conclui uma negociação paga — `PATCH /v1/commercial-transactions/{id}/complete`. */
  concluir(id: number): Observable<CommercialTransactionDto> {
    return this.api.patch<CommercialTransactionDto>(`/commercial-transactions/${id}/complete`, {});
  }

  /** Cancela uma negociação não paga — `PATCH /v1/commercial-transactions/{id}/cancel`. */
  cancelar(id: number): Observable<CommercialTransactionDto> {
    return this.api.patch<CommercialTransactionDto>(`/commercial-transactions/${id}/cancel`, {});
  }

  statusNegociacaoLabel(status: CommercialTransactionStatus): string {
    switch (status) {
      case 'Requested':
        return 'Solicitada';
      case 'Accepted':
        return 'Aceita';
      case 'Rejected':
        return 'Recusada';
      case 'Cancelled':
        return 'Cancelada';
      case 'Paid':
        return 'Paga';
      case 'Completed':
        return 'Concluída';
      default:
        return status;
    }
  }

  // ── Helpers de exibição ──────────────────────────────────────────────────

  formatarPreco(valor: number | string): string {
    const n = typeof valor === 'string' ? Number(valor) : valor;
    return (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  tipoLabel(tipo: ProductTransactionType): string {
    switch (tipo) {
      case 'Sale':
        return 'Venda';
      case 'Rent':
        return 'Aluguel';
      case 'RentAndSale':
        return 'Venda e aluguel';
      default:
        return '';
    }
  }

  private toParams(query: ProductQuery): Record<string, string | number | boolean | undefined> {
    return {
      search: query.search,
      name: query.name,
      categoryId: query.categoryId,
      userId: query.userId,
      transactionType: query.transactionType,
      isActive: query.isActive,
      take: query.take,
      skip: query.skip,
    };
  }

  private toPage(r: ResponseFindAllProductDto): Page<ProductListItemDto> {
    return {
      items: r.products ?? [],
      currentPage: r.currentPage,
      totalPages: r.totalPages,
      totalRecords: r.totalRecords,
    };
  }
}
