import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../../core/services/marketplace';
import { ProductListItemDto } from '../../../../core/models/product';
import { ProductTransactionType } from '../../../../core/models/enums';
import { ApiError } from '../../../../core/models/common';

/** Tipos de negociação exibidos na vertical de compra e venda do fornecedor. */
const TIPOS_VENDA: ProductTransactionType[] = ['Sale', 'RentAndSale'];

@Component({
  selector: 'app-listagem-produtos',
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-produtos.html',
  styleUrl: './listagem-produtos.scss',
})
export class ListagemProdutosComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  produtos: ProductListItemDto[] = [];
  categoryId?: number;
  categoriaNome = '';
  busca = '';
  /** Modo "meus produtos" (gestão do fornecedor) vs vitrine (comprador). */
  mine = false;
  carregando = false;
  erro = '';

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('categoryId');
    this.categoryId = id ? Number(id) : undefined;
    this.categoriaNome = this.route.snapshot.queryParamMap.get('categoria') ?? '';
    this.mine =
      this.route.snapshot.queryParamMap.get('mine') === '1' ||
      this.route.snapshot.data['mine'] === true;
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    const query = { categoryId: this.categoryId, search: this.busca.trim() || undefined };
    const req$ = this.mine ? this.marketplace.meusProdutos(query) : this.marketplace.produtos(query);
    req$.pipe(finalize(() => (this.carregando = false))).subscribe({
      // Na gestão do fornecedor, compra e venda mostra apenas Venda e Venda e aluguel;
      // itens só de aluguel (Rent) ficam na vertical de aluguel. A vitrine pública é inalterada.
      next: (page) =>
        (this.produtos = this.mine
          ? page.items.filter((p) => TIPOS_VENDA.includes(p.transactionType))
          : page.items),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os produtos.';
      },
    });
  }

  buscar() {
    this.carregar();
  }

  get titulo(): string {
    if (this.mine) return 'Meus produtos';
    return this.categoriaNome || 'Produtos';
  }

  abrirProduto(id: number) {
    if (this.mine) {
      this.router.navigate(['/compra-vender/produto/editar', id]);
    } else {
      this.router.navigate(['/compra-vender/produto', id]);
    }
  }

  novoProduto() {
    this.router.navigate(['/compra-vender/produto/novo']);
  }

  excluir(id: number, event: Event) {
    event.stopPropagation();
    if (!confirm('Remover este produto?')) return;
    this.marketplace.remover(id).subscribe({
      next: () => (this.produtos = this.produtos.filter((p) => p.id !== id)),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível remover o produto.';
      },
    });
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.marketplace.formatarPreco(valor);
  }

  tipoLabel(produto: ProductListItemDto): string {
    return this.marketplace.tipoLabel(produto.transactionType);
  }
}
