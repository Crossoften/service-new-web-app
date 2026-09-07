import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { Page } from '../models/pagination';
import { ApiMessage } from '../models/common';
import {
  CreateTransportationDto,
  TransportationCategoryDto,
  TransportationDto,
  TransportationListItemDto,
  TransportationQuery,
  UpdateTransportationDto,
} from '../models/transportation';
import {
  CancelTransportRequestDto,
  CreateTransportRequestDto,
  QuoteTransportRequestDto,
  RespondTransportRequestDto,
  TransportRequestDto,
  TransportRequestQuery,
  TransportRequestStatus,
} from '../models/transport-request';

interface ResponseFindAllTransportationDto {
  transportations: TransportationListItemDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface ResponseFindAllTransportRequestDto {
  transportRequests: TransportRequestDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateTransportRequestResponseDto {
  message: string;
  transportRequest: TransportRequestDto;
}

interface CreateTransportationResponseDto {
  message: string;
  transportation: TransportationDto;
}

/** Transporte: catálogo (`/transportations`) e pedidos (`/transport-requests`). */
@Injectable({ providedIn: 'root' })
export class TransportService {
  private readonly api = inject(ApiService);

  // ── Catálogo ───────────────────────────────────────────────────────────

  transportes(query: TransportationQuery = {}): Observable<Page<TransportationListItemDto>> {
    return this.api
      .get<ResponseFindAllTransportationDto>('/transportations', {
        search: query.search,
        name: query.name,
        categoryId: query.categoryId,
        userId: query.userId,
        isActive: query.isActive,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.transportations ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  /** Transportes do fornecedor autenticado — `GET /v1/transportations/my-transportations`. */
  meusTransportes(query: TransportationQuery = {}): Observable<Page<TransportationListItemDto>> {
    return this.api
      .get<ResponseFindAllTransportationDto>('/transportations/my-transportations', {
        search: query.search,
        categoryId: query.categoryId,
        isActive: query.isActive,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.transportations ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  categorias(): Observable<TransportationCategoryDto[]> {
    return this.api.get<TransportationCategoryDto[]>('/transportations/categories');
  }

  transporte(id: number): Observable<TransportationDto> {
    return this.api.get<TransportationDto>(`/transportations/${id}`);
  }

  /** Cadastra um transporte (fornecedor) — `POST /v1/transportations`. */
  criar(dto: CreateTransportationDto): Observable<TransportationDto> {
    return this.api
      .post<CreateTransportationResponseDto>('/transportations', dto)
      .pipe(map((r) => r.transportation));
  }

  /** Edita um transporte — `PATCH /v1/transportations/{id}`. */
  atualizar(id: number, dto: UpdateTransportationDto): Observable<TransportationDto> {
    return this.api.patch<TransportationDto>(`/transportations/${id}`, dto);
  }

  /** Remove um transporte — `DELETE /v1/transportations/{id}`. */
  remover(id: number): Observable<ApiMessage> {
    return this.api.delete<ApiMessage>(`/transportations/${id}`);
  }

  // ── Pedidos ────────────────────────────────────────────────────────────

  solicitar(dto: CreateTransportRequestDto): Observable<TransportRequestDto> {
    return this.api
      .post<CreateTransportRequestResponseDto>('/transport-requests', dto)
      .pipe(map((r) => r.transportRequest));
  }

  pedidos(query: TransportRequestQuery = {}): Observable<Page<TransportRequestDto>> {
    return this.api
      .get<ResponseFindAllTransportRequestDto>('/transport-requests', {
        status: query.status,
        participantRole: query.participantRole,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.transportRequests ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  pedido(id: number): Observable<TransportRequestDto> {
    return this.api.get<TransportRequestDto>(`/transport-requests/${id}`);
  }

  /** Transportador cota o pedido — `PATCH /transport-requests/{id}/quote`. */
  cotar(id: number, dto: QuoteTransportRequestDto): Observable<TransportRequestDto> {
    return this.api.patch<TransportRequestDto>(`/transport-requests/${id}/quote`, dto);
  }

  /** Solicitante aceita/rejeita a cotação — `.../respond`. */
  responder(id: number, dto: RespondTransportRequestDto): Observable<TransportRequestDto> {
    return this.api.patch<TransportRequestDto>(`/transport-requests/${id}/respond`, dto);
  }

  /** Transportador inicia (em trânsito) — `.../start`. */
  iniciar(id: number): Observable<TransportRequestDto> {
    return this.api.patch<TransportRequestDto>(`/transport-requests/${id}/start`, {});
  }

  /** Transportador marca como entregue — `.../deliver`. */
  entregar(id: number): Observable<TransportRequestDto> {
    return this.api.patch<TransportRequestDto>(`/transport-requests/${id}/deliver`, {});
  }

  /** Cancela um pedido ainda não entregue — `.../cancel`. */
  cancelar(id: number, dto: CancelTransportRequestDto = {}): Observable<TransportRequestDto> {
    return this.api.patch<TransportRequestDto>(`/transport-requests/${id}/cancel`, dto);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  formatarPreco(valor?: number | string): string {
    const n = typeof valor === 'string' ? Number(valor) : (valor ?? 0);
    return (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  statusLabel(status: TransportRequestStatus): string {
    switch (status) {
      case 'Requested':
        return 'Solicitado';
      case 'Quoted':
        return 'Cotado';
      case 'Accepted':
        return 'Aceito';
      case 'Rejected':
        return 'Recusado';
      case 'InTransit':
        return 'Em trânsito';
      case 'Delivered':
        return 'Entregue';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
