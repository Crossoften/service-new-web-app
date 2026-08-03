import { SocialNetwork, UserProfileType, UserRole } from './enums';

/** Perfis apresentados no Front (selecionar-perfil). */
export type Perfil = 'cliente' | 'fornecedor' | 'parceiro' | 'entregador';

/**
 * Mapeia o perfil do FE para a rota de cadastro da API.
 * Decisão D2: "parceiro" → `influencer`.
 */
export const REGISTER_PATHS: Record<Perfil, string> = {
  cliente: 'client',
  fornecedor: 'supplier',
  parceiro: 'influencer',
  entregador: 'delivery',
};

// ── Login ────────────────────────────────────────────────────────────────────
export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ResponseLoginDto {
  token: string;
  id: number;
  role?: UserRole;
  profileType?: UserProfileType;
  adminPermissions?: unknown[];
}

// ── Cadastro ─────────────────────────────────────────────────────────────────
export interface CreateUserSocialMediaDto {
  network: SocialNetwork;
  url: string;
  followers?: number;
}

export interface RegisterBaseDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
  phone?: string;
  socialMedias?: CreateUserSocialMediaDto[];
  birthDate?: string;
  inviteCode?: string;
  referralCode?: string;
}

/** Mesma forma do base; `referralCode` é gerado se omitido (perfil influencer). */
export type RegisterInfluencerDto = RegisterBaseDto;

export interface RegisterUserResponseDto {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    profileType: UserProfileType;
    status: string;
  };
}

// ── Recuperação de senha ─────────────────────────────────────────────────────
export interface ForgotDto {
  email: string;
}

export interface ResetPasswordDto {
  code: string;
  password: string;
  confirmPassword: string;
}

/** Confirmação de conta pós-cadastro — `POST /v1/no-auth/verify-code`. */
export interface VerifyCodeDto {
  code: string;
}
