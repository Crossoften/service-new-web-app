import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../core/services/marketplace';
import { CommercialTransactionDto } from '../../../core/models/commercial-transaction';
import { ApiError } from '../../../core/models/common';

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
