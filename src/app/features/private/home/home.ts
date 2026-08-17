import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  devMenuAberto = false;

  servicos = [
    { label: 'DELIVERY',                rota: '/delivery' },
    { label: 'SERVIÇOS',                rota: '/servicos' },
    { label: 'COMPRA E VENDER',         rota: '/compra-vender' },
    { label: 'ALUGUEL',                 rota: '/aluguel' },
    { label: 'TRANSPORTE',              rota: '/transporte' },
    { label: 'HOSPEDAGEM',              rota: '/hospedagem' },
    { label: 'EMPREGOS E EMPREGADORES', rota: '/empregos/vagas' },
    { label: 'ANUNCIE AQUI',            rota: null },
  ];

  constructor(private router: Router) {}

  toggleDevMenu() {
    this.devMenuAberto = !this.devMenuAberto;
  }

  navegar(rota: string | null) {
    if (rota) {
      this.devMenuAberto = false;
      this.router.navigate([rota]);
    }
  }

  /** Encerra a sessão e volta ao login (permite trocar de conta/perfil). */
  sair() {
    this.devMenuAberto = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}