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
  /** OPCIONAL — pode ser omitido inteiro (telefone é a identidade principal). */
  email?: string;
  /** Obrigatório (E.164). */
  phone: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
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
    /** Nulo quando a conta foi criada sem e-mail. */
    email: string | null;
    phone?: string;
    profileType: UserProfileType;
    /** Conta nasce `"Pending"` (verificação por SMS pendente). */
    status: string;
  };
}

// ── Recuperação de senha ─────────────────────────────────────────────────────
/** Solicita o código de redefinição — `POST /no-auth/forgot`. */
export interface ForgotDto {
  /** Canal de envio: `sms` (principal, telefone) ou `email`. */
  channel: 'sms' | 'email';
  /** E-mail ou telefone (E.164). */
  identifier: string;
}

/** Redefine a senha — `POST /no-auth/reset`. Código = 6 dígitos. */
export interface ResetPasswordDto {
  /** Mesmo `identifier` do `forgot`. */
  identifier: string;
  code: string;
  password: string;
  confirmPassword: string;
}

/** Confirmação de **conta** pós-cadastro — `POST /v1/no-auth/verify-account`. */
export interface VerifyAccountDto {
  /** Telefone (E.164) usado no cadastro. */
  identifier: string;
  /** Código de 6 dígitos recebido por SMS. */
  code: string;
}

/**
 * Validação do código de **recuperação de senha** (opcional) — `POST /v1/no-auth/verify-code`.
 * Fluxo distinto do `verify-account` (campos separados no back; um não invalida o outro).
 */
export interface VerifyCodeDto {
  identifier: string;
  code: string;
}

/** Reenvio do SMS de verificação de conta — `POST /v1/no-auth/resend-verification`. */
export interface ResendVerificationDto {
  /** E-mail ou telefone (E.164) usado no cadastro. */
  identifier: string;
}
