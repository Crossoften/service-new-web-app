import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';

/**
 * Bloqueia rotas privadas: exige sessão autenticada, senão redireciona ao login.
 *
 * NOTA: ainda não está aplicado às rotas (app.routes.ts) — será conectado no
 * módulo de Auth, quando o login real passar a popular a SessionService.
 */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
