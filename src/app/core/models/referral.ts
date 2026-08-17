import { UserProfileType, UserStatus } from './enums';

/** Usuário indicado (ReferredUserDto). */
export interface ReferredUserDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileType: UserProfileType;
  status: UserStatus;
  registeredAt: string;
}

/** Indicação do influencer (MyReferralDto). `status` = "Convertido" | "Aguardando Pagamento". */
export interface MyReferralDto {
  id: number;
  status: string;
  commissionAmount?: number;
  paidAt?: string;
  createdAt: string;
  referredUser: ReferredUserDto;
}

/** `GET /v1/referrals/me` (ResponseMyReferralsDto). */
export interface ResponseMyReferralsDto {
  referralCode?: string;
  referrals: MyReferralDto[];
  totalRecords: number;
}

/** `GET /v1/referrals/me/summary` (ResponseMyReferralsSummaryDto). */
export interface ResponseMyReferralsSummaryDto {
  referralCode?: string;
  totalReferrals: number;
  totalPaying: number;
  accumulatedCommission: number;
  rankingPosition: number;
  commissionRate?: number;
  effectiveCommissionRate: number;
}
