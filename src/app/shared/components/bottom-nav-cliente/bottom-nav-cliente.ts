import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChatUnreadStore } from '../../../core/services/chat-unread-store';

/**
 * Aba ativa do menu do cliente. `mensagens` está previsto (inbox de chats) mas
 * depende do back (BE-Q5, `GET /chats`) — por isso a aba não é renderizada até lá.
 */
export type TabCliente = 'inicio' | 'atividade' | 'mensagens' | 'perfil';

/**
 * Menu inferior compartilhado do CLIENTE. Substitui os navs hardcoded por tela.
 * Abas: Início · Atividade · Mensagens · Perfil (Mensagens habilitada com o inbox
 * de chats — BE-Q5). O componente é **puro**: o total de não-lidos chega por
 * `@Input() naoLidas`; quem busca o número é a tela (nunca este nav).
 */
@Component({
  selector: 'app-bottom-nav-cliente',
  imports: [CommonModule],
  templateUrl: './bottom-nav-cliente.html',
  styleUrl: './bottom-nav-cliente.scss',
})
export class BottomNavClienteComponent {
  @Input() tabAtiva: TabCliente = 'inicio';
  /** Total de não lidos (badge da aba Mensagens) — lido do store, sem HTTP aqui. */
  protected readonly unread = inject(ChatUnreadStore);

  constructor(public router: Router) {}

  navegar(tab: TabCliente) {
    const rotas: Record<TabCliente, string> = {
      inicio: '/home',
      atividade: '/atividade',
      mensagens: '/mensagens', // reservado — só quando BE-Q5 existir
      perfil: '/perfil',
    };
    this.router.navigate([rotas[tab]]);
  }
}
