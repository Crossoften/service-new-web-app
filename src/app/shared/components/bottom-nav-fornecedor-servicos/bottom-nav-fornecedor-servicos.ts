import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TabFornecedorServicos = 'home' | 'trabalhos' | 'orcamentos' | 'perfil' | 'mais';

@Component({
  selector: 'app-bottom-nav-fornecedor-servicos',
  imports: [CommonModule],
  templateUrl: './bottom-nav-fornecedor-servicos.html',
  styleUrl: './bottom-nav-fornecedor-servicos.scss'
})
export class BottomNavFornecedorServicosComponent {
  @Input() tabAtiva: TabFornecedorServicos = 'home';

  constructor(public router: Router) {}

  navegar(tab: TabFornecedorServicos) {
    const rotas: Record<TabFornecedorServicos, string> = {
      home:       '/fornecedor/servicos',
      trabalhos:  '/fornecedor/servicos/trabalhos',
      orcamentos: '/fornecedor/servicos/orcamentos',
      perfil:     '/fornecedor/servicos/perfil',
      mais:       '/fornecedor/servicos/mais',
    };
    this.router.navigate([rotas[tab]]);
  }
}