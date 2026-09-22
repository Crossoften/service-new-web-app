import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Aba ativa do menu do cliente. `mensagens` está previsto (inbox de chats) mas
 * depende do back (BE-Q5, `GET /chats`) — por isso a aba não é renderizada até lá.
 */
export type TabCliente = 'inicio' | 'atividade' | 'mensagens' | 'perfil';

/**
 * Menu inferior compartilhado do CLIENTE. Substitui os navs hardcoded por tela.
 * Lançado com 3 abas (Início · Atividade · Perfil); Mensagens entra quando o
 * inbox de chats existir no back (BE-Q5).
 */
@Component({
  selector: 'app-bottom-nav-cliente',
  imports: [CommonModule],
  templateUrl: './bottom-nav-cliente.html',
  styleUrl: './bottom-nav-cliente.scss',
})
export class BottomNavClienteComponent {
  @Input() tabAtiva: TabCliente = 'inicio';

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
