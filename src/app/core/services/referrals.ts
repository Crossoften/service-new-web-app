import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  ResponseMyReferralsDto,
  ResponseMyReferralsSummaryDto,
} from '../models/referral';

/** Indicações do influencer autenticado (`/referrals/me`). */
@Injectable({ providedIn: 'root' })
export class ReferralsService {
  private readonly api = inject(ApiService);

  /** Lista de indicados — `GET /v1/referrals/me`. */
  me(): Observable<ResponseMyReferralsDto> {
    return this.api.get<ResponseMyReferralsDto>('/referrals/me');
  }

  /** Estatísticas de indicação — `GET /v1/referrals/me/summary`. */
  summary(): Observable<ResponseMyReferralsSummaryDto> {
    return this.api.get<ResponseMyReferralsSummaryDto>('/referrals/me/summary');
  }
}
