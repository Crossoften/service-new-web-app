import { Injectable, computed, signal } from '@angular/core';
import { AuthSession } from '../models/session';
import { UserProfileType } from '../models/enums';

const STORAGE_KEY = 'service-app.session';

/**
 * Fonte única da sessão do usuário: guarda token + identidade e expõe estado reativo
 * via signals. Persiste em localStorage para sobreviver a reloads (PWA).
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _session = signal<AuthSession | null>(this.restore());

  /** Sessão atual (readonly). */
  readonly session = this._session.asReadonly();

  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly token = computed<string | null>(() => this._session()?.token ?? null);
  readonly userId = computed<number | null>(() => this._session()?.userId ?? null);
  readonly profileType = computed<UserProfileType | null>(
    () => this._session()?.profileType ?? null,
  );

  /** Define a sessão após login bem-sucedido. */
  setSession(session: AuthSession): void {
    this._session.set(session);
    this.persist(session);
  }

  /** Encerra a sessão (logout / 401). */
  clear(): void {
    this._session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage indisponível — estado em memória já foi limpo.
    }
  }

  private persist(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // storage indisponível — segue apenas com o estado em memória.
    }
  }

  private restore(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
