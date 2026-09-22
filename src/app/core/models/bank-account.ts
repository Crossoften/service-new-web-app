import { BankAccountType, PixKeyType } from './enums';

/**
 * Corpo de `POST /v1/bank-accounts` (CreateBankAccountDto).
 * `pixKeyType`/`pixKey` são **opcionais e andam juntos** (§8.5): mandar um sem o
 * outro devolve `400`; ambos vazios apagam o Pix. Pode enviar com máscara (o back normaliza).
 */
export interface CreateBankAccountDto {
  bankName: string;
  accountType: BankAccountType;
  agency: string;
  account: string;
  cpf: string;
  pixKeyType?: PixKeyType;
  pixKey?: string;
}

/** Corpo de `PATCH /v1/bank-accounts/me` (UpdateBankAccountDto). Omitir Pix não mexe no que está lá. */
export type UpdateBankAccountDto = Partial<CreateBankAccountDto>;

/** `GET /v1/bank-accounts/me` (ResponseBankAccountDto) — conta única por usuário. */
export interface ResponseBankAccountDto {
  id: number;
  bankName: string;
  accountType: BankAccountType;
  agency: string;
  account: string;
  cpf: string;
  /** Chave Pix cadastrada (já normalizada pelo back), quando houver (§8.5). */
  pixKeyType?: PixKeyType;
  pixKey?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
