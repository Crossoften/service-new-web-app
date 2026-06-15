import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TabParceiro = 'home' | 'codigo' | 'indicacoes' | 'perfil' | 'mais';

@Component({
  selector: 'app-bottom-nav-parceiro',
  imports: [CommonModule],
  templateUrl: './bottom-nav-parceiro.html',
  styleUrl: './bottom-nav-parceiro.scss'
})
export class BottomNavParceiroComponent {
  @Input() tabAtiva: TabParceiro = 'home';

  constructor(public router: Router) {}

  navegar(tab: TabParceiro) {
    const rotas: Record<TabParceiro, string> = {
      home:       '/parceiro/home',
      codigo:     '/parceiro/codigo',
      indicacoes: '/parceiro/indicacoes',
      perfil:     '/parceiro/perfil',
      mais:       '/parceiro/mais',
    };
    this.router.navigate([rotas[tab]]);
  }
}