import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import { ResponseCouponValidateDto, ValidateCouponDto } from '../models/coupon';

/** Prévia do cupom aplicada à sacola (view-model). */
export interface CupomPrevia {
  codigo: string;
  tipo: string;
  desconto: number;
  descricao: string;
}

/** Cupons de delivery — só a pré-visualização pública (§8.9). */
@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = inject(ApiService);

  /**
   * Pré-visualiza um cupom — `POST /v1/coupons/validate`.
   * ⚠️ Prévia apenas: o desconto retornado **não** é enviado na criação do pedido;
   * o back recalcula. Cupom inválido → `400` com a razão em `message`.
   */
  validar(dto: ValidateCouponDto): Observable<CupomPrevia> {
    return this.api
      .post<ResponseCouponValidateDto>('/coupons/validate', dto)
      .pipe(map((r) => this.mapPrevia(r)));
  }

  private mapPrevia(r: ResponseCouponValidateDto): CupomPrevia {
    return {
      codigo: r.code,
      tipo: r.type,
      desconto: Number(r.discount ?? 0),
      descricao: r.description ?? '',
    };
  }
}
