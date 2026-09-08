import { BillingType, SocialNetwork, UserProfileType, UserRole, UserStatus } from './enums';

/** Rede social vinculada ao perfil (ResponseProfileSocialMediaDto). */
export interface ResponseProfileSocialMediaDto {
  id: number;
  network: SocialNetwork;
  url: string;
  followers: number;
  createdAt: string;
  updatedAt: string;
}

/** Endereço do perfil (ResponseAddressDto). */
export interface ResponseAddressDto {
  id: number;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  /** Coordenadas (Fase 8.4) — voltam como string p/ não perder casas decimais. */
  latitude?: string;
  longitude?: string;
  createdAt: string;
  updatedAt: string;
}

/** Perfil completo do usuário logado — `GET /v1/profile/me` (ResponseProfileDto). */
export interface ResponseProfileDto {
  id: number;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  biography?: string;
  role: UserRole;
  profileType: UserProfileType;
  status: UserStatus;
  fileUrl?: string;
  fileKey?: string;
  referralCode?: string;
  birthDate?: string;
  commissionRate?: number;
  socialMedias: ResponseProfileSocialMediaDto[];
  createdAt: string;
  updatedAt: string;
  address?: ResponseAddressDto;
  billingType?: BillingType;
}

/** Corpo de `PATCH /v1/profile/me` (UpdateProfileDto). Todos os campos são opcionais. */
export interface UpdateProfileDto {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
  biography?: string;
  fileUrl?: string;
  fileKey?: string;
}

/** Corpo de `PATCH /v1/profile/me/address` (UpdateAddressDto). */
export interface UpdateAddressDto {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  /** Aceitam número ou texto; enviamos como string (Fase 8.4). Capturadas via mapa (MAP-2). */
  latitude?: string;
  longitude?: string;
}

/** Corpo de `PATCH /v1/profile/me/billing-type` (UpdateBillingTypeDto). */
export interface UpdateBillingTypeDto {
  billingType: BillingType;
}

/** Dados de conta do usuário logado — `GET /v1/my-self` (ResponseAllUserDto). */
export interface ResponseAllUserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  code: string;
  role: UserRole;
  profileType: UserProfileType;
  status: UserStatus;
  fileUrl: string;
  fileKey: string;
  createdAt: string;
  updatedAt: string;
}
