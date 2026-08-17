import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { BudgetService, Orcamento } from '../../../../core/services/budget';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-aprovar-orcamento',
  imports: [CommonModule],
  templateUrl: './aprovar-orcamento.html',
  styleUrl: './aprovar-orcamento.scss',
})
export class AprovarOrcamentoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly budgets = inject(BudgetService);

  orcamento?: Orcamento;
  carregando = false;
  processando = false;
  erro = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.budgets
      .orcamento(id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (o) => (this.orcamento = o),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o orçamento.';
        },
      });
  }

  /** Aprova o orçamento respondido — gera o trabalho e leva às solicitações. */
  solicitar() {
    if (!this.orcamento || this.processando) return;
    this.processando = true;
    this.erro = '';
    this.budgets
      .aprovar(this.orcamento.id)
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => this.router.navigate(['/servicos/solicitacoes']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível aprovar o orçamento.';
        },
      });
  }

  /** Responde a um acréscimo solicitado pelo fornecedor. */
  responderAcrescimo(status: 'Approved' | 'Rejected') {
    if (!this.orcamento || this.processando) return;
    this.processando = true;
    this.erro = '';
    this.budgets
      .responderAcrescimo(this.orcamento.id, { status })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => {
          if (this.orcamento) this.orcamento.temAcrescimoPendente = false;
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível responder ao acréscimo.';
        },
      });
  }

  voltar() {
    history.back();
  }

  abrirChat() {}
  abrirNotificacoes() {}

  formatarPreco(valor: number): string {
    return this.budgets.formatarPreco(valor);
  }
}
