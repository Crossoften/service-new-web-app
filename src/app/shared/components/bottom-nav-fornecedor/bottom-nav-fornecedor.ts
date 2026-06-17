import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TabFornecedor = 'home' | 'cardapio' | 'pedidos' | 'perfil' | 'mais';

@Component({
  selector: 'app-bottom-nav-fornecedor',
  imports: [CommonModule],
  templateUrl: './bottom-nav-fornecedor.html',
  styleUrl: './bottom-nav-fornecedor.scss'
})
export class BottomNavFornecedorComponent {
  @Input() tabAtiva: TabFornecedor = 'home';

  constructor(public router: Router) {}

  navegar(tab: TabFornecedor) {
    const rotas: Record<TabFornecedor, string> = {
      home:     '/fornecedor/home',
      cardapio: '/fornecedor/cardapio',
      pedidos:  '/fornecedor/pedidos',
      perfil:   '/fornecedor/perfil',
      mais:     '/fornecedor/mais',
    };
    this.router.navigate([rotas[tab]]);
  }
}