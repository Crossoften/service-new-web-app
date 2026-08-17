import { BankAccountType } from './enums';

/** Corpo de `POST /v1/bank-accounts` (CreateBankAccountDto). */
export interface CreateBankAccountDto {
  bankName: string;
  accountType: BankAccountType;
  agency: string;
  account: string;
  cpf: string;
}

/** Corpo de `PATCH /v1/bank-accounts/me` (UpdateBankAccountDto). */
export type UpdateBankAccountDto = Partial<CreateBankAccountDto>;

/** `GET /v1/bank-accounts/me` (ResponseBankAccountDto) — conta única por usuário. */
export interface ResponseBankAccountDto {
  id: number;
  bankName: string;
  accountType: BankAccountType;
  agency: string;
  account: string;
  cpf: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
