import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';

/**
 * Bloqueia rotas privadas: exige sessão autenticada, senão redireciona ao login.
 * Aplicado às rotas privadas em `app.routes.ts` (Auth Slice 3).
 */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
