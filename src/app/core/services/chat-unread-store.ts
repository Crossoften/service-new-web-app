import { Injectable, inject, signal } from '@angular/core';
import { ChatService } from './chat';
import { SessionService } from './session';

/**
 * Estado compartilhado do total de mensagens não lidas (BE-Q5).
 *
 * Fonte única para o badge do menu (cliente) e do hub (fornecedor): as telas
 * chamam `refresh()` ao carregar e os menus **apenas leem** o signal — nenhum
 * menu compartilhado faz HTTP (evita corromper o `HttpTestingController` e
 * disparar requisições inesperadas em telas que o renderizam).
 */
@Injectable({ providedIn: 'root' })
export class ChatUnreadStore {
  private readonly chat = inject(ChatService);
  private readonly session = inject(SessionService);

  private readonly _total = signal(0);
  /** Total de não lidos (reativo) para os badges. */
  readonly total = this._total.asReadonly();

  /** Atualiza o total via `GET /chats/unread-count` — só com sessão ativa. */
  refresh(): void {
    if (!this.session.isAuthenticated()) {
      this._total.set(0);
      return;
    }
    this.chat.naoLidasTotal().subscribe({
      next: (t) => this._total.set(t),
      error: () => {
        /* mantém o último valor conhecido */
      },
    });
  }

  /** Define o total diretamente (ex.: após abrir/ler o inbox). */
  definir(total: number): void {
    this._total.set(Math.max(0, total));
  }

  /** Zera o total (ex.: no logout). */
  zerar(): void {
    this._total.set(0);
  }
}
