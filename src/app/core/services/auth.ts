import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { SessionService } from './session';
import { UserProfileType } from '../models/enums';
import { AuthSession } from '../models/session';
import { ApiMessage } from '../models/common';
import {
  ForgotDto,
  LoginUserDto,
  Perfil,
  REGISTER_PATHS,
  RegisterBaseDto,
  RegisterUserResponseDto,
  ResetPasswordDto,
  ResponseLoginDto,
} from '../models/auth';

/** Rota inicial por perfil após o login (usa o `profileType` do ResponseLoginDto). */
const PROFILE_HOME_ROUTES: Record<UserProfileType, string> = {
  Client: '/home',
  Supplier: '/fornecedor/home',
  Delivery: '/entregador/home',
  Influencer: '/parceiro/home',
  Partner: '/parceiro/home',
};

/** Camada de autenticação: login, cadastro e recuperação de senha, integrada à sessão. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);

  /** Autentica e persiste a sessão (token + profileType) em caso de sucesso. */
  login(dto: LoginUserDto): Observable<ResponseLoginDto> {
    return this.api
      .post<ResponseLoginDto>('/login', dto)
      .pipe(tap((res) => this.session.setSession(this.toSession(res))));
  }

  /** Cadastro por perfil (cliente/fornecedor/parceiro/entregador → rota `register/*`). */
  register(perfil: Perfil, dto: RegisterBaseDto): Observable<RegisterUserResponseDto> {
    return this.api.post<RegisterUserResponseDto>(`/no-auth/register/${REGISTER_PATHS[perfil]}`, dto);
  }

  /** Envia o código de redefinição ao email. */
  forgot(dto: ForgotDto): Observable<ApiMessage> {
    return this.api.post<ApiMessage>('/no-auth/forgot', dto);
  }

  /** Redefine a senha a partir do código recebido por email. */
  reset(dto: ResetPasswordDto): Observable<ApiMessage> {
    return this.api.post<ApiMessage>('/no-auth/reset', dto);
  }

  /** Encerra a sessão localmente. */
  logout(): void {
    this.session.clear();
  }

  /** Rota inicial correspondente ao perfil autenticado. */
  homeRouteFor(profileType: UserProfileType | null): string {
    return profileType ? PROFILE_HOME_ROUTES[profileType] : '/home';
  }

  private toSession(res: ResponseLoginDto): AuthSession {
    return {
      token: res.token,
      userId: res.id,
      profileType: res.profileType ?? null,
      role: res.role ?? null,
    };
  }
}
