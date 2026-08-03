import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';
import { AuthService } from '../services/auth';

/**
 * Bloqueia as telas públicas de autenticação quando **já existe sessão**:
 * redireciona para a home do perfil logado. Para entrar com outra conta, é
 * preciso **sair** (logout) primeiro — evita "login por cima de login".
 */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (session.isAuthenticated()) {
    return router.createUrlTree([auth.homeRouteFor(session.profileType())]);
  }
  return true;
};
