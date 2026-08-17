import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { Page } from '../models/pagination';
import {
  AccommodationCategoryDto,
  AccommodationDto,
  AccommodationListItemDto,
  AccommodationQuery,
} from '../models/accommodation';
import {
  BookingDto,
  BookingQuery,
  BookingStatus,
  CancelBookingDto,
  CreateBookingDto,
  RespondBookingDto,
} from '../models/booking';

interface ResponseFindAllAccommodationDto {
  accommodations: AccommodationListItemDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface ResponseFindAllBookingDto {
  bookings: BookingDto[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

interface CreateBookingResponseDto {
  message: string;
  booking: BookingDto;
}

/** Hospedagens (`/accommodations`) e reservas (`/bookings`). */
@Injectable({ providedIn: 'root' })
export class AccommodationService {
  private readonly api = inject(ApiService);

  // ── Hospedagens ──────────────────────────────────────────────────────────

  acomodacoes(query: AccommodationQuery = {}): Observable<Page<AccommodationListItemDto>> {
    return this.api
      .get<ResponseFindAllAccommodationDto>('/accommodations', {
        search: query.search,
        name: query.name,
        city: query.city,
        state: query.state,
        categoryId: query.categoryId,
        userId: query.userId,
        isActive: query.isActive,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.accommodations ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  categorias(): Observable<AccommodationCategoryDto[]> {
    return this.api.get<AccommodationCategoryDto[]>('/accommodations/categories');
  }

  acomodacao(id: number): Observable<AccommodationDto> {
    return this.api.get<AccommodationDto>(`/accommodations/${id}`);
  }

  // ── Reservas ───────────────────────────────────────────────────────────

  reservar(dto: CreateBookingDto): Observable<BookingDto> {
    return this.api.post<CreateBookingResponseDto>('/bookings', dto).pipe(map((r) => r.booking));
  }

  reservas(query: BookingQuery = {}): Observable<Page<BookingDto>> {
    return this.api
      .get<ResponseFindAllBookingDto>('/bookings', {
        status: query.status,
        participantRole: query.participantRole,
        take: query.take,
        skip: query.skip,
      })
      .pipe(
        map((r) => ({
          items: r.bookings ?? [],
          currentPage: r.currentPage,
          totalPages: r.totalPages,
          totalRecords: r.totalRecords,
        })),
      );
  }

  reserva(id: number): Observable<BookingDto> {
    return this.api.get<BookingDto>(`/bookings/${id}`);
  }

  /** Anfitrião confirma/rejeita — `.../respond`. */
  responder(id: number, dto: RespondBookingDto): Observable<BookingDto> {
    return this.api.patch<BookingDto>(`/bookings/${id}/respond`, dto);
  }

  /** Anfitrião registra check-in — `.../check-in`. */
  checkIn(id: number): Observable<BookingDto> {
    return this.api.patch<BookingDto>(`/bookings/${id}/check-in`, {});
  }

  /** Anfitrião conclui — `.../complete`. */
  concluir(id: number): Observable<BookingDto> {
    return this.api.patch<BookingDto>(`/bookings/${id}/complete`, {});
  }

  /** Cancela uma reserva não concluída — `.../cancel`. */
  cancelar(id: number, dto: CancelBookingDto = {}): Observable<BookingDto> {
    return this.api.patch<BookingDto>(`/bookings/${id}/cancel`, dto);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  formatarPreco(valor?: number | string): string {
    const n = typeof valor === 'string' ? Number(valor) : (valor ?? 0);
    return (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  statusLabel(status: BookingStatus): string {
    switch (status) {
      case 'Requested':
        return 'Solicitada';
      case 'Confirmed':
        return 'Confirmada';
      case 'Rejected':
        return 'Recusada';
      case 'CheckedIn':
        return 'Check-in';
      case 'Completed':
        return 'Concluída';
      case 'Cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  }
}
