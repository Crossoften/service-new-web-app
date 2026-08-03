import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { ApiMessage, UploadedFile } from '../models/common';
import {
  ResponseAddressDto,
  ResponseAllUserDto,
  ResponseProfileDto,
  UpdateAddressDto,
  UpdateBillingTypeDto,
  UpdateProfileDto,
} from '../models/profile';

/** Perfil do usuário logado: leitura e edição de dados, endereço, foto e cobrança. */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  /** Perfil completo — `GET /v1/profile/me`. */
  me(): Observable<ResponseProfileDto> {
    return this.api.get<ResponseProfileDto>('/profile/me');
  }

  /** Dados de conta — `GET /v1/my-self`. */
  mySelf(): Observable<ResponseAllUserDto> {
    return this.api.get<ResponseAllUserDto>('/my-self');
  }

  /** Atualiza dados do perfil — `PATCH /v1/profile/me`. */
  update(dto: UpdateProfileDto): Observable<ResponseProfileDto> {
    return this.api.patch<ResponseProfileDto>('/profile/me', dto);
  }

  /** Atualiza o endereço — `PATCH /v1/profile/me/address`. */
  updateAddress(dto: UpdateAddressDto): Observable<ResponseAddressDto> {
    return this.api.patch<ResponseAddressDto>('/profile/me/address', dto);
  }

  /** Atualiza o modelo de cobrança (fornecedor) — `PATCH /v1/profile/me/billing-type`. */
  updateBillingType(dto: UpdateBillingTypeDto): Observable<ResponseProfileDto> {
    return this.api.patch<ResponseProfileDto>('/profile/me/billing-type', dto);
  }

  /** Faz upload de uma nova foto de perfil — `POST /v1/upload/one-file`. */
  uploadPhoto(file: File): Observable<UploadedFile> {
    return this.api.uploadOne(file);
  }

  /** Remove a foto de perfil — `DELETE /v1/profile-photo`. */
  deletePhoto(): Observable<ApiMessage> {
    return this.api.delete<ApiMessage>('/profile-photo');
  }
}
