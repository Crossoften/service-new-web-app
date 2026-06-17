import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FornecedorService, ItemCardapioFornecedor } from '../../../core/services/fornecedor';
import { BottomNavFornecedorComponent } from '../../../shared/components/bottom-nav-fornecedor/bottom-nav-fornecedor';

@Component({
  selector: 'app-gerenciar-cardapio',
  imports: [CommonModule, BottomNavFornecedorComponent],
  templateUrl: './gerenciar-cardapio.html',
  styleUrl: './gerenciar-cardapio.scss'
})
export class GerenciarCardapioComponent implements OnInit {
  itens: ItemCardapioFornecedor[] = [];

  constructor(
    public router: Router,
    private fornecedorService: FornecedorService
  ) {}

  ngOnInit() {
    this.itens = this.fornecedorService.getCardapio();
  }

  adicionar() {
    this.router.navigate(['/fornecedor/cardapio/novo']);
  }

  editar(item: ItemCardapioFornecedor) {
    this.router.navigate(['/fornecedor/cardapio/editar', item.id]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}