import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../../core/services/marketplace';
import { ProductListItemDto } from '../../../../core/models/product';
import { ProductTransactionType } from '../../../../core/models/enums';
import { ApiError } from '../../../../core/models/common';

type TabAluguel = 'ativos' | 'inativos';

/** Tipos de negociação que aparecem na vertical de aluguel do fornecedor. */
const TIPOS_ALUGUEL: ProductTransactionType[] = ['Rent', 'RentAndSale'];

@Component({
  selector: 'app-listagem-aluguel-fornecedor',
  imports: [CommonModule],
  templateUrl: './listagem-aluguel-fornecedor.html',
  styleUrl: './listagem-aluguel-fornecedor.scss',
})
export class ListagemAluguelFornecedorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly marketplace = inject(MarketplaceService);

  tabAtiva: TabAluguel = 'ativos';
  itens: ProductListItemDto[] = [];
  carregando = false;
  erro = '';

  tabs: { id: TabAluguel; label: string }[] = [
    { id: 'ativos', label: 'Ativos' },
    { id: 'inativos', label: 'Inativos' },
  ];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    // O back filtra por um único transactionType; como aluguel abrange
    // Rent e RentAndSale, trazemos os produtos do fornecedor e filtramos aqui.
    this.marketplace
      .meusProdutos({ isActive: this.tabAtiva === 'ativos' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.itens = page.items.filter((p) => TIPOS_ALUGUEL.includes(p.transactionType))),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar seus itens de aluguel.';
        },
      });
  }

  trocarTab(tab: TabAluguel) {
    if (this.tabAtiva === tab) return;
    this.tabAtiva = tab;
    this.carregar();
  }

  tipoLabel(tipo: ProductTransactionType): string {
    return this.marketplace.tipoLabel(tipo);
  }

  formatarPreco(valor: number | string): string {
    return this.marketplace.formatarPreco(valor);
  }

  adicionar() {
    this.router.navigate(['/fornecedor/aluguel/criar']);
  }

  abrir(p: ProductListItemDto) {
    this.router.navigate(['/fornecedor/aluguel/criar'], { queryParams: { id: p.id } });
  }

  voltar() {
    this.router.navigate(['/fornecedor']);
  }
}
