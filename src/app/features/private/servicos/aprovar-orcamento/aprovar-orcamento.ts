import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BudgetService, Orcamento } from '../../../../core/services/budget';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-aprovar-orcamento',
  imports: [CommonModule, FormsModule],
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
  mostrandoRecusa = false;
  motivoRecusa = '';

  /** Aprovar/recusar só faz sentido em orçamento respondido (§8.8: ambos terminais). */
  get podeDecidir(): boolean {
    return this.orcamento?.statusApi === 'Responded';
  }

  /** Rótulo do desfecho, para orçamentos já terminados. */
  get desfechoLabel(): string {
    switch (this.orcamento?.statusApi) {
      case 'Accepted':
        return 'Orçamento aceito';
      case 'Rejected':
        return 'Orçamento recusado';
      case 'Cancelled':
        return 'Pedido cancelado';
      default:
        return '';
    }
  }

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

  /** Abre/fecha o campo de motivo da recusa. */
  alternarRecusa() {
    this.mostrandoRecusa = !this.mostrandoRecusa;
    this.erro = '';
  }

  /** Cliente recusa o preço (§8.8). Motivo é opcional. */
  rejeitar() {
    if (!this.orcamento || this.processando) return;
    this.processando = true;
    this.erro = '';
    this.budgets
      .rejeitar(this.orcamento.id, { rejectReason: this.motivoRecusa.trim() || undefined })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => this.router.navigate(['/servicos/orcamentos']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível recusar o orçamento.';
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

  /** Abre a sala de chat do orçamento (BE-CHAT-1). */
  abrirChat() {
    const chatId = this.orcamento?.chatId;
    if (chatId) this.router.navigate(['/chat', chatId]);
  }

  voltar() {
    history.back();
  }

  abrirNotificacoes() {}

  formatarPreco(valor: number): string {
    return this.budgets.formatarPreco(valor);
  }
}
