import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session';
import { UserProfileType } from '../models/enums';

/**
 * Restringe uma rota a determinados perfis (profileType do usuário logado).
 * Uso: `canActivate: [authGuard, profileGuard('Supplier')]`.
 *
 * NOTA: ainda não aplicado às rotas — pronto para o wiring nos módulos.
 */
export function profileGuard(...allowed: UserProfileType[]): CanActivateFn {
  return () => {
    const session = inject(SessionService);
    const router = inject(Router);

    if (!session.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }
    const profile = session.profileType();
    if (profile && allowed.includes(profile)) {
      return true;
    }
    return router.createUrlTree(['/home']);
  };
}
