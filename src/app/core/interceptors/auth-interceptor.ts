import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session';

/**
 * Anexa o Bearer JWT (securityScheme `bearerAuth`) em toda requisição autenticada.
 * Requisições sem sessão seguem sem o header (rotas /no-auth, /login, /plans/active…).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SessionService).token();
  if (!token) {
    return next(req);
  }
  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
