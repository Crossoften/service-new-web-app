import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ResponseFindAllPlansDto } from '../models/plan';
import {
  CreateSubscriptionDto,
  CreateSubscriptionResponseDto,
  ResponseSubscriptionCatalogDto,
  ResponseSubscriptionDto,
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

  /**
   * Assinatura "atual" de uma categoria — `GET /v1/subscriptions/current` (Bearer).
   * Com várias assinaturas, "a atual" ficou ambígua: passe `categoryId` para obter
   * a da categoria certa. Devolve **também a vencida** (de propósito, para oferecer
   * a renovação) — quem diz se vale são `expired`/`inGracePeriod`, não a ausência.
   */
  current(categoryId?: number): Observable<ResponseSubscriptionDto> {
    return this.api.get<ResponseSubscriptionDto>(
      '/subscriptions/current',
      categoryId != null ? { categoryId } : undefined,
    );
  }

  /**
   * Renova manualmente uma assinatura — `POST /v1/subscriptions/:id/renew` (Bearer).
   * Só é aceito quando `needsRenewal` (senão o back responde 400). A resposta traz
   * `checkoutUrl` (Mercado Pago) para concluir o pagamento.
   */
  renew(id: number): Observable<CreateSubscriptionResponseDto> {
    return this.api.post<CreateSubscriptionResponseDto>(`/subscriptions/${id}/renew`, {});
  }

  /**
   * Reativa uma assinatura marcada para cancelar no fim do período (desfaz o
   * cancelamento) — `PATCH /v1/subscriptions/:id/reactivate` (Bearer). Sem nova
   * cobrança; só é aceito quando `cancelAtPeriodEnd` (senão 400).
   */
  reactivate(id: number): Observable<ResponseSubscriptionDto> {
    return this.api.patch<ResponseSubscriptionDto>(`/subscriptions/${id}/reactivate`, {});
  }

  /**
   * Cancela uma assinatura — `PATCH /v1/subscriptions/:id/cancel` (Bearer).
   * Agenda o cancelamento para o fim do período: o acesso segue até
   * `currentPeriodEnd` e `cancelAtPeriodEnd` passa a `true` (não renova mais).
   */
  cancel(id: number): Observable<ResponseSubscriptionDto> {
    return this.api.patch<ResponseSubscriptionDto>(`/subscriptions/${id}/cancel`, {});
  }
}
