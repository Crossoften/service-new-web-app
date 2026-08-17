import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ApiMessage } from '../models/common';
import {
  CreateBankAccountDto,
  ResponseBankAccountDto,
  UpdateBankAccountDto,
} from '../models/bank-account';

interface CreateBankAccountResponseDto {
  message: string;
  bankAccount: ResponseBankAccountDto;
}

/** Dados bancários do usuário autenticado (`/bank-accounts`) — conta única. */
@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private readonly api = inject(ApiService);

  /** Conta bancária do usuário — `GET /v1/bank-accounts/me`. */
  me(): Observable<ResponseBankAccountDto> {
    return this.api.get<ResponseBankAccountDto>('/bank-accounts/me');
  }

  /** Cadastra a conta bancária — `POST /v1/bank-accounts`. */
  criar(dto: CreateBankAccountDto): Observable<CreateBankAccountResponseDto> {
    return this.api.post<CreateBankAccountResponseDto>('/bank-accounts', dto);
  }

  /** Edita a conta bancária — `PATCH /v1/bank-accounts/me`. */
  atualizar(dto: UpdateBankAccountDto): Observable<ResponseBankAccountDto> {
    return this.api.patch<ResponseBankAccountDto>('/bank-accounts/me', dto);
  }

  /** Remove a conta bancária — `DELETE /v1/bank-accounts/me`. */
  remover(): Observable<ApiMessage> {
    return this.api.delete<ApiMessage>('/bank-accounts/me');
  }
}
