import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ResponseFindAllPlansDto } from '../models/plan';
import {
  CreateSubscriptionDto,
  CreateSubscriptionResponseDto,
  ResponseSubscriptionCatalogDto,
} from '../models/subscription';

/** Assinatura por categoria do fornecedor: catálogo e criação (checkout MP). */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);

  /** Lista os planos ativos — `GET /v1/plans/active` (público). */
  activePlans(): Observable<ResponseFindAllPlansDto> {
    return this.api.get<ResponseFindAllPlansDto>('/plans/active');
  }

  /**
   * Catálogo de assinatura — `GET /v1/subscriptions/catalog` (Bearer).
   * Traz os planos e as categorias assináveis com o status de cada assinatura
   * (`isSubscribed`), base da tela de contratação por categoria.
   */
  catalog(): Observable<ResponseSubscriptionCatalogDto> {
    return this.api.get<ResponseSubscriptionCatalogDto>('/subscriptions/catalog');
  }

  /**
   * Cria a assinatura de uma categoria — `POST /v1/subscriptions` (Bearer).
   * Exige `planId` + `categoryId`; a resposta traz `checkoutUrl` (Mercado Pago)
   * para onde o browser é redirecionado.
   */
  create(dto: CreateSubscriptionDto): Observable<CreateSubscriptionResponseDto> {
    return this.api.post<CreateSubscriptionResponseDto>('/subscriptions', dto);
  }
}
