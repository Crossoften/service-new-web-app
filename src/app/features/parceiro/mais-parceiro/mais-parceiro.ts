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

  opcoes = [
    { label: 'Notificações', rota: null },
    { label: 'Saldo',        rota: '/parceiro/saldo' },
    { label: 'FAQ',          rota: null },
    { label: 'Sobre',        rota: null },
    { label: 'Termos de Uso', rota: null },
    { label: 'Política de Privacidade', rota: null },
    { label: 'Fale Conosco', rota: null },
    { label: 'Sair',         rota: '/login' },
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