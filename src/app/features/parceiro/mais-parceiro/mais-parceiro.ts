import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-mais-parceiro',
  imports: [CommonModule],
  templateUrl: './mais-parceiro.html',
  styleUrl: './mais-parceiro.scss'
})
export class MaisParceiroComponent {
  private readonly auth = inject(AuthService);

  // Itens sem destino (Notificações, FAQ, Sobre, Termos, Política, Fale Conosco)
  // removidos por ora para não haver clique silencioso — religar quando houver páginas.
  opcoes = [
    { label: 'Saldo', rota: '/parceiro/saldo' },
    { label: 'Sair',  rota: '/login' },
  ];

  constructor(private router: Router) {}

  navegar(rota: string | null) {
    if (!rota) return;
    // "Sair" precisa encerrar a sessão antes (senão o guestGuard devolve para a home).
    if (rota === '/login') {
      this.auth.logout();
    }
    this.router.navigate([rota]);
  }

  voltar() {
    history.back();
  }
}