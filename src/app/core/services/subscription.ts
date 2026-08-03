import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ResponseFindAllPlansDto } from '../models/plan';
import { CreateSubscriptionDto, CreateSubscriptionResponseDto } from '../models/subscription';

/** Planos ativos e criação de assinatura (fluxo do fornecedor). */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);

  /** Lista os planos ativos — `GET /v1/plans/active` (público). */
  activePlans(): Observable<ResponseFindAllPlansDto> {
    return this.api.get<ResponseFindAllPlansDto>('/plans/active');
  }

  /** Cria a assinatura do usuário autenticado — `POST /v1/subscriptions` (Bearer). */
  create(dto: CreateSubscriptionDto): Observable<CreateSubscriptionResponseDto> {
    return this.api.post<CreateSubscriptionResponseDto>('/subscriptions', dto);
  }
}
