import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export type TabFornecedor = 'home' | 'cardapio' | 'restaurante' | 'perfil' | 'categorias';

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
      home:        '/fornecedor/home',
      cardapio:    '/fornecedor/cardapio',
      restaurante: '/fornecedor/restaurante',
      perfil:      '/fornecedor/perfil',
      categorias:  '/fornecedor',
    };
    this.router.navigate([rotas[tab]]);
  }
}