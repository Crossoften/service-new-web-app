import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api';
import { SessionService } from './session';
import { UserProfileType } from '../models/enums';
import { AuthSession } from '../models/session';
import { ApiMessage } from '../models/common';
import { ResponseAllUserDto } from '../models/profile';
import {
  ForgotDto,
  LoginUserDto,
  Perfil,
  REGISTER_PATHS,
  RegisterBaseDto,
  RegisterUserResponseDto,
  ResetPasswordDto,
  ResponseLoginDto,
  VerifyCodeDto,
} from '../models/auth';

/** Rota inicial por perfil após o login (usa o `profileType` do ResponseLoginDto). */
const PROFILE_HOME_ROUTES: Record<UserProfileType, string> = {
  Client: '/home',
  Supplier: '/fornecedor/home',
  Delivery: '/entregador/home',
  Influencer: '/parceiro/home',
};

/** Camada de autenticação: login, cadastro e recuperação de senha, integrada à sessão. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);

  /**
   * Autentica e persiste a sessão (token + profileType).
   * O `/login` nem sempre retorna o `profileType`; quando faltar, buscamos em `/my-self`
   * para o roteamento por perfil e o `profileGuard` funcionarem (senão o usuário fica preso como cliente).
   */
  login(dto: LoginUserDto): Observable<ResponseLoginDto> {
    // Limpa qualquer sessão anterior antes de autenticar (evita mistura ao trocar de conta).
    this.session.clear();
    return this.api.post<ResponseLoginDto>('/login', dto).pipe(
      tap((res) => this.session.setSession(this.toSession(res))),
      switchMap((res) => {
        if (this.session.profileType()) return of(res);
        // `/my-self` usa o Bearer da sessão já definida acima.
        return this.api.get<ResponseAllUserDto>('/my-self').pipe(
          tap((me) =>
            this.session.setSession({
              token: res.token,
              userId: res.id ?? me.id,
              profileType: me.profileType ?? null,
              role: me.role ?? res.role ?? null,
            }),
          ),
          map(() => res),
          catchError(() => of(res)),
        );
      }),
    );
  }

  /** Cadastro por perfil (cliente/fornecedor/parceiro/entregador → rota `register/*`). */
  register(perfil: Perfil, dto: RegisterBaseDto): Observable<RegisterUserResponseDto> {
    return this.api.post<RegisterUserResponseDto>(`/no-auth/register/${REGISTER_PATHS[perfil]}`, dto);
  }

  /** Confirma a conta com o código enviado por email — `POST /v1/no-auth/verify-code`. */
  verifyCode(dto: VerifyCodeDto): Observable<ApiMessage> {
    return this.api.post<ApiMessage>('/no-auth/verify-code', dto);
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
