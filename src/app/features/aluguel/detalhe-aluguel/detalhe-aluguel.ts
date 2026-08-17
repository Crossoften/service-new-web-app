import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../core/services/marketplace';
import { RentalService } from '../../../core/services/rental';
import { ProductDto } from '../../../core/models/product';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-detalhe-aluguel',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhe-aluguel.html',
  styleUrl: './detalhe-aluguel.scss',
})
export class DetalheAluguelComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly rental = inject(RentalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  produtoId = 0;
  produto?: ProductDto;
  carregando = false;
  processando = false;
  erro = '';
  sucesso = '';

  dataInicio = '';
  dataFim = '';
  valor?: number;
  condicoes = '';

  ngOnInit() {
    this.produtoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.marketplace
      .produto(this.produtoId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (p) => {
          this.produto = p;
          this.valor = Number(p.price);
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o item.';
        },
      });
  }

  solicitar() {
    if (!this.produto || this.processando) return;
    this.erro = '';
    if (!this.dataInicio || !this.dataFim) {
      this.erro = 'Informe as datas de início e fim.';
      return;
    }
    if (new Date(this.dataFim) < new Date(this.dataInicio)) {
      this.erro = 'A data de fim deve ser posterior à de início.';
      return;
    }
    if (this.valor === undefined || this.valor < 0) {
      this.erro = 'Informe um valor válido.';
      return;
    }
    this.processando = true;
    this.rental
      .solicitar({
        productId: this.produto.id,
        startDate: new Date(this.dataInicio).toISOString(),
        endDate: new Date(this.dataFim).toISOString(),
        price: this.valor,
        conditions: this.condicoes.trim() || undefined,
      })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Solicitação de aluguel enviada! O locador foi notificado.';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível solicitar o aluguel.';
        },
      });
  }

  verMeusAlugueis() {
    this.router.navigate(['/aluguel/meus']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.marketplace.formatarPreco(valor);
  }
}
