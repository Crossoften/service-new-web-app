import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatService, ConversaInbox } from '../../../core/services/chat';
import { ApiError } from '../../../core/models/common';
import { BottomNavClienteComponent } from '../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';

/**
 * Inbox de conversas (BE-Q5). Lista `GET /chats` com o não-lido por conversa e
 * usa `GET /chats/unread-count` para o badge do menu. Abre a sala em `/chat/:id`.
 */
@Component({
  selector: 'app-mensagens',
  imports: [CommonModule, BottomNavClienteComponent],
  templateUrl: './mensagens.html',
  styleUrl: './mensagens.scss',
})
export class MensagensComponent implements OnInit {
  private readonly chat = inject(ChatService);
  private readonly router = inject(Router);

  conversas: ConversaInbox[] = [];
  totalNaoLidas = 0;
  carregando = false;
  erro = '';

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
    // Total para o badge do menu (contagem oficial do back, não a soma da página).
    this.chat.naoLidasTotal().subscribe({
      next: (t) => (this.totalNaoLidas = t),
      error: () => (this.totalNaoLidas = 0),
    });
  }

  abrir(conversa: ConversaInbox) {
    this.router.navigate(['/chat', conversa.id]);
  }
}
