import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../core/services/marketplace';
import { CommercialTransactionDto } from '../../../core/models/commercial-transaction';
import { CommercialTransactionStatus } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

/** Negociações "ativas" = ainda em jogo (não terminais). O resto é histórico. */
const STATUS_ATIVOS: CommercialTransactionStatus[] = ['Requested', 'Accepted', 'Paid'];

type AbaNegociacoes = 'ativos' | 'historico';

@Component({
  selector: 'app-negociacoes',
  imports: [CommonModule],
  templateUrl: './negociacoes.html',
  styleUrl: './negociacoes.scss',
})
export class NegociacoesComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly router = inject(Router);

  negociacoes: CommercialTransactionDto[] = [];
  carregando = false;
  erro = '';
  aba: AbaNegociacoes = 'ativos';

  ngOnInit() {
    this.carregando = true;
    this.marketplace
      .negociacoes({ participantRole: 'All' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.negociacoes = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as negociações.';
        },
      });
  }

  ehAtivo(n: CommercialTransactionDto): boolean {
    return STATUS_ATIVOS.includes(n.status);
  }

  selecionarAba(aba: AbaNegociacoes) {
    this.aba = aba;
  }

  /** Negociações da aba atual: ativas (em jogo) ou histórico (terminais). */
  get negociacoesFiltradas(): CommercialTransactionDto[] {
    const querAtivos = this.aba === 'ativos';
    return this.negociacoes.filter((n) => this.ehAtivo(n) === querAtivos);
  }

  abrir(id: number) {
    this.router.navigate(['/compra-vender/negociacao', id]);
  }

  voltar() {
    history.back();
  }

  statusLabel(n: CommercialTransactionDto): string {
    return this.marketplace.statusNegociacaoLabel(n.status);
  }

  valor(n: CommercialTransactionDto): string {
    return this.marketplace.formatarPreco(n.agreedAmount ?? n.requestedAmount);
  }
}
