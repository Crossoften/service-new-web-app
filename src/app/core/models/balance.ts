import { PaymentMethod } from './enums';

/** Usuário resumido no saldo (ResponseBalanceUserDto). */
export interface BalanceUserDto {
  id: number;
  name: string;
  fileUrl?: string;
}

/** Serviço resumido no saldo (ResponseBalanceServiceDto). */
export interface BalanceServiceDto {
  id: number;
  name: string;
}

/** Item de recebimento (ResponseBalanceReceiptItemDto). `amount` é string. */
export interface BalanceReceiptItemDto {
  id: number;
  amount: string;
  description?: string;
  method?: PaymentMethod;
  availableAt?: string;
  createdAt: string;
  payer: BalanceUserDto;
  service?: BalanceServiceDto;
}

/** `GET /v1/balances/receipts` (ResponseBalanceReceiptsDto). */
export interface ResponseBalanceReceiptsDto {
  currentMonthBalance: string;
  recentReceipts: BalanceReceiptItemDto[];
}
