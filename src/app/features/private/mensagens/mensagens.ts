import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService, ConversaInbox } from '../../../core/services/chat';
import { ChatUnreadStore } from '../../../core/services/chat-unread-store';
import { SessionService } from '../../../core/services/session';
import { ApiError } from '../../../core/models/common';
import { BottomNavClienteComponent } from '../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';

/**
 * Inbox de conversas (BE-Q5). Lista `GET /chats` com o não-lido por conversa e
 * abre a sala em `/chat/:id`.
 *
 * O inbox é compartilhado (as conversas são do usuário, cliente ou fornecedor),
 * mas o **menu inferior é do cliente**. Por isso ele só aparece para o cliente;
 * o fornecedor (que chega pelo hub) usa o botão Voltar e não vê o menu do
 * cliente — senão as abas o levariam para as telas de cliente.
 */
@Component({
  selector: 'app-mensagens',
  imports: [CommonModule, BottomNavClienteComponent],
  templateUrl: './mensagens.html',
  styleUrl: './mensagens.scss',
})
export class MensagensComponent implements OnInit {
  private readonly chat = inject(ChatService);
  private readonly unread = inject(ChatUnreadStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  conversas: ConversaInbox[] = [];
  carregando = false;
  erro = '';

  /** Só o cliente vê o menu inferior de cliente (evita jogar o fornecedor nas telas de cliente). */
  get isCliente(): boolean {
    return this.session.profileType() === 'Client';
  }

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.chat.inbox().subscribe({
      next: (lista) => {
        this.conversas = lista;
        this.carregando = false;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as conversas.';
      },
    });
    // Atualiza o badge do menu com a contagem oficial (BE-Q5).
    this.unread.refresh();
  }

  abrir(conversa: ConversaInbox) {
    this.router.navigate(['/chat', conversa.id]);
  }

  voltar() {
    history.back();
  }
}
