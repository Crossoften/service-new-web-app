import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { FornecedorService, ItemCardapioFornecedor } from '../../../core/services/fornecedor';
import { BottomNavFornecedorComponent } from '../../../shared/components/bottom-nav-fornecedor/bottom-nav-fornecedor';
import { ResponseRestaurantDto } from '../../../core/models/restaurant';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-gerenciar-cardapio',
  imports: [CommonModule, BottomNavFornecedorComponent],
  templateUrl: './gerenciar-cardapio.html',
  styleUrl: './gerenciar-cardapio.scss',
})
export class GerenciarCardapioComponent implements OnInit {
  private readonly fornecedorService = inject(FornecedorService);
  readonly router = inject(Router);

  restaurante: ResponseRestaurantDto | null = null;
  itens: ItemCardapioFornecedor[] = [];
  carregando = false;
  erro = '';
  aviso = '';

  ngOnInit() {
    this.carregar();
  }

  get semRestaurante(): boolean {
    return !this.carregando && this.restaurante === null;
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.fornecedorService
      .meuRestaurante()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (r) => {
          this.restaurante = r;
          this.itens = r ? this.fornecedorService.itensDe(r) : [];
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o cardápio.';
        },
      });
  }

  criarRestaurante() {
    this.router.navigate(['/fornecedor/restaurante']);
  }

  adicionar() {
    this.router.navigate(['/fornecedor/cardapio/novo']);
  }

  editar(item: ItemCardapioFornecedor) {
    this.router.navigate(['/fornecedor/cardapio/editar', item.id]);
  }

  excluir(item: ItemCardapioFornecedor) {
    this.erro = '';
    this.aviso = '';
    this.fornecedorService.excluirItem(item.id).subscribe({
      next: (res) => {
        // Some do cardápio nos dois casos; a mensagem distingue apagado × desativado.
        this.itens = this.itens.filter((i) => i.id !== item.id);
        this.aviso = res.message?.trim()
          ? res.message
          : res.deleted
            ? 'Item excluído.'
            : 'Item desativado (já consta em pedidos) — deixa de aparecer no cardápio do cliente.';
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível excluir o item.';
      },
    });
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
