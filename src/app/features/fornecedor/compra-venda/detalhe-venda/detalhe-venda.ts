import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../../core/services/marketplace';
import { ProductDto } from '../../../../core/models/product';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-detalhe-venda',
  imports: [CommonModule],
  templateUrl: './detalhe-venda.html',
  styleUrl: './detalhe-venda.scss',
})
export class DetalheVendaComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  produtoId = 0;
  produto?: ProductDto;
  carregando = false;
  processando = false;
  erro = '';
  sucesso = '';

  ngOnInit() {
    this.produtoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.marketplace
      .produto(this.produtoId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (p) => (this.produto = p),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o produto.';
        },
      });
  }

  /** Abre uma negociação sobre o produto (oferta pelo valor anunciado). */
  temInteresse() {
    if (!this.produto || this.processando) return;
    this.processando = true;
    this.erro = '';
    this.sucesso = '';
    this.marketplace
      .iniciarNegociacao({
        referenceType: 'Product',
        referenceId: this.produto.id,
        requestedAmount: Number(this.produto.price),
      })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Negociação iniciada! O vendedor foi notificado.';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível iniciar a negociação.';
        },
      });
  }

  verNegociacoes() {
    this.router.navigate(['/compra-vender/negociacoes']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.marketplace.formatarPreco(valor);
  }

  get tipoLabel(): string {
    return this.produto ? this.marketplace.tipoLabel(this.produto.transactionType) : '';
  }
}
