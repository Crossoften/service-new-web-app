import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map } from 'rxjs';
import { MarketplaceService } from '../../../core/services/marketplace';
import { ProductListItemDto } from '../../../core/models/product';
import { ApiError } from '../../../core/models/common';
import { OrdenacaoItensComponent } from '../../../shared/components/ordenacao-itens/ordenacao-itens';
import { OrdenacaoItem, ordenarItens } from '../../../core/utils/item-search';

@Component({
  selector: 'app-listagem-aluguel',
  imports: [CommonModule, FormsModule, OrdenacaoItensComponent],
  templateUrl: './listagem-aluguel.html',
  styleUrl: './listagem-aluguel.scss',
})
export class ListagemAluguelComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  produtos: ProductListItemDto[] = [];
  categoryId?: number;
  categoriaNome = '';
  busca = '';
  ordenacao: OrdenacaoItem = 'relevancia';
  carregando = false;
  erro = '';

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('categoryId');
    this.categoryId = id ? Number(id) : undefined;
    this.categoriaNome = this.route.snapshot.queryParamMap.get('categoria') ?? '';
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.marketplace
      .produtos({ categoryId: this.categoryId, search: this.busca.trim() || undefined })
      // Aluguel: apenas produtos com transactionType Rent ou RentAndSale.
      .pipe(
        map((page) => page.items.filter((p) => p.transactionType !== 'Sale')),
        finalize(() => (this.carregando = false)),
      )
      .subscribe({
        next: (itens) => (this.produtos = itens),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os itens.';
        },
      });
  }

  buscar() {
    this.carregar();
  }

  get produtosOrdenados(): ProductListItemDto[] {
    return ordenarItens(this.produtos, this.ordenacao);
  }

  abrirProduto(id: number) {
    this.router.navigate(['/aluguel/produto', id]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.marketplace.formatarPreco(valor);
  }
}
