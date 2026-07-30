import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TabEntregador = 'home' | 'trabalhos' | 'orcamentos' | 'perfil' | 'mais';

@Component({
  selector: 'app-bottom-nav-entregador',
  imports: [CommonModule],
  templateUrl: './bottom-nav-entregador.html',
  styleUrl: './bottom-nav-entregador.scss'
})
export class BottomNavEntregadorComponent {
  @Input() tabAtiva: TabEntregador = 'home';

  constructor(public router: Router) {}

  navegar(tab: TabEntregador) {
    const rotas: Record<TabEntregador, string> = {
      home:       '/entregador/home',
      trabalhos:  '/entregador/trabalhos',
      orcamentos: '/entregador/orcamentos',
      perfil:     '/entregador/perfil',
      mais:       '/entregador/mais',
    };
    this.router.navigate([rotas[tab]]);
  }
}