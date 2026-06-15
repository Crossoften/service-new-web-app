import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  devMenuAberto = false;

  servicos = [
    { label: 'DELIVERY',                rota: '/delivery' },
    { label: 'SERVIÇOS',                rota: '/servicos' },
    { label: 'COMPRA E VENDER',         rota: '/compra-vender' },
    { label: 'ALUGUEL',                 rota: '/aluguel' },
    { label: 'TRANSPORTE',              rota: '/transporte' },
    { label: 'HOSPEDAGEM',              rota: null },
    { label: 'EMPREGOS E EMPREGADORES', rota: '/empregos' },
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
}