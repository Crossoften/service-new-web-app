import { UserProfileType, UserRole } from './enums';

/**
 * Sessão autenticada persistida localmente.
 * Preenchida a partir do ResponseLoginDto (token, id, profileType, role).
 */
export interface AuthSession {
  token: string;
  userId: number;
  profileType: UserProfileType | null;
  role: UserRole | null;
}
