import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session';
import { ApiError } from '../models/common';

/** Mensagens padrão por código HTTP (fallback quando a API não envia texto). */
const DEFAULT_MESSAGES: Record<number, string> = {
  0: 'Falha de conexão. Verifique sua internet e tente novamente.',
  400: 'Requisição inválida. Confira os dados informados.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para essa ação.',
  404: 'Recurso não encontrado.',
  409: 'Já existe um registro com esses dados.',
  422: 'Tamanho ou tipo de arquivo inválido.',
  500: 'Erro interno no servidor. Tente novamente mais tarde.',
};

/**
 * Normaliza erros HTTP para um `ApiError` estável e trata o 401 de forma central:
 * limpa a sessão e redireciona ao login.
 */
/** Trecho que identifica o 403 de "assinatura ativa" exigida do fornecedor. */
const SUBSCRIPTION_REQUIRED = 'assinatura ativa';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        session.clear();
        void router.navigate(['/login']);
      } else if (error.status === 403 && requiresSubscription(error)) {
        // Fornecedor sem assinatura ativa → leva à tela de planos (não redireciona
        // a partir da própria tela de assinatura nem das rotas de planos/assinatura).
        const url = error.url ?? '';
        const naTelaDeAssinatura = router.url.startsWith('/fornecedor/assinatura');
        const chamadaDeAssinatura = url.includes('/plans') || url.includes('/subscriptions');
        if (!naTelaDeAssinatura && !chamadaDeAssinatura) {
          void router.navigate(['/fornecedor/assinatura']);
        }
      }
      return throwError(() => normalize(error));
    }),
  );
};

function requiresSubscription(error: HttpErrorResponse): boolean {
  const message = extractMessage(error.error as unknown) ?? '';
  return message.toLowerCase().includes(SUBSCRIPTION_REQUIRED);
}

function normalize(error: HttpErrorResponse): ApiError {
  const raw = error.error as unknown;
  const message = extractMessage(raw) ?? DEFAULT_MESSAGES[error.status] ?? 'Ocorreu um erro inesperado.';
  return { status: error.status, message, raw };
}

function extractMessage(raw: unknown): string | null {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw;
  }
  if (raw && typeof raw === 'object' && 'message' in raw) {
    const message = (raw as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && message.length > 0) {
      return message.join(' ');
    }
  }
  return null;
}
