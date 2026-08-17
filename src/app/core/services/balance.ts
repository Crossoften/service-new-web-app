import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ResponseBalanceReceiptsDto } from '../models/balance';

/** Saldo do usuário autenticado (`/balances`). */
@Injectable({ providedIn: 'root' })
export class BalanceService {
  private readonly api = inject(ApiService);

  /** Saldo do mês + últimos recebimentos — `GET /v1/balances/receipts`. */
  receipts(): Observable<ResponseBalanceReceiptsDto> {
    return this.api.get<ResponseBalanceReceiptsDto>('/balances/receipts');
  }
}
