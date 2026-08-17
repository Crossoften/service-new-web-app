import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { Page } from '../models/pagination';
import {
  CancelRentalDto,
  CreateRentalDto,
  RentalDto,
  RentalQuery,
  RentalStatus,
  RespondRentalDto,
} from '../models/rental';

interface ResponseFindAllRentalDto {
  rentals: RentalDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateRentalResponseDto {
  message: string;
  rental: RentalDto;
}

/** Aluguéis de produtos (`/rentals`). */
@Injectable({ providedIn: 'root' })
export class RentalService {
  private readonly api = inject(ApiService);

  /** Solicita o aluguel de um produto — `POST /v1/rentals`. */
  solicitar(dto: CreateRentalDto): Observable<RentalDto> {
    return this.api.post<CreateRentalResponseDto>('/rentals', dto).pipe(map((r) => r.rental));
  }

  /** Lista aluguéis do usuário — `GET /v1/rentals`. */
  alugueis(query: RentalQuery = {}): Observable<Page<RentalDto>> {
    return this.api
      .get<ResponseFindAllRentalDto>('/rentals', {
        status: query.status,
        participantRole: query.participantRole,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.rentals ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  /** Detalhe de um aluguel — `GET /v1/rentals/{id}`. */
  aluguel(id: number): Observable<RentalDto> {
    return this.api.get<RentalDto>(`/rentals/${id}`);
  }

  /** Locador aceita/rejeita — `PATCH /v1/rentals/{id}/respond`. */
  responder(id: number, dto: RespondRentalDto): Observable<RentalDto> {
    return this.api.patch<RentalDto>(`/rentals/${id}/respond`, dto);
  }

  /** Locador marca como iniciado (retirada) — `PATCH /v1/rentals/{id}/start`. */
  iniciar(id: number): Observable<RentalDto> {
    return this.api.patch<RentalDto>(`/rentals/${id}/start`, {});
  }

  /** Locador marca como devolvido — `PATCH /v1/rentals/{id}/return`. */
  devolver(id: number): Observable<RentalDto> {
    return this.api.patch<RentalDto>(`/rentals/${id}/return`, {});
  }

  /** Cancela um aluguel ainda não devolvido — `PATCH /v1/rentals/{id}/cancel`. */
  cancelar(id: number, dto: CancelRentalDto = {}): Observable<RentalDto> {
    return this.api.patch<RentalDto>(`/rentals/${id}/cancel`, dto);
  }

  formatarPreco(valor: number | string): string {
    const n = typeof valor === 'string' ? Number(valor) : valor;
    return (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  statusLabel(status: RentalStatus): string {
    switch (status) {
      case 'Requested':
        return 'Solicitado';
      case 'Accepted':
        return 'Aceito';
      case 'Rejected':
        return 'Recusado';
      case 'Active':
        return 'Em andamento';
      case 'Returned':
        return 'Devolvido';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
