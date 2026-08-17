import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { MarketplaceService } from '../../../core/services/marketplace';
import { SessionService } from '../../../core/services/session';
import { CommercialTransactionDto } from '../../../core/models/commercial-transaction';
import { PaymentMethod } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-negociacao-detalhe',
  imports: [CommonModule],
  templateUrl: './negociacao-detalhe.html',
  styleUrl: './negociacao-detalhe.scss',
})
export class NegociacaoDetalheComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id = 0;
  negociacao?: CommercialTransactionDto;
  carregando = false;
  processando = false;
  erro = '';

  metodos: { id: PaymentMethod; label: string }[] = [
    { id: 'Pix', label: 'PIX' },
    { id: 'CreditCard', label: 'Cartão' },
    { id: 'BankSlip', label: 'Boleto' },
  ];
  metodoSelecionado: PaymentMethod = 'Pix';

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.marketplace
      .negociacao(this.id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (n) => (this.negociacao = n),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a negociação.';
        },
      });
  }

  // ── Papéis / permissões ──────────────────────────────────────────────────

  get souComprador(): boolean {
    return !!this.negociacao && this.session.userId() === this.negociacao.buyer.id;
  }

  get souVendedor(): boolean {
    return !!this.negociacao && this.session.userId() === this.negociacao.seller.id;
  }

  get podeResponder(): boolean {
    return this.souVendedor && this.negociacao?.status === 'Requested';
  }

  get podePagar(): boolean {
    return this.souComprador && this.negociacao?.status === 'Accepted';
  }

  get podeConcluir(): boolean {
    return (this.souComprador || this.souVendedor) && this.negociacao?.status === 'Paid';
  }

  get podeCancelar(): boolean {
    const s = this.negociacao?.status;
    return (this.souComprador || this.souVendedor) && (s === 'Requested' || s === 'Accepted');
  }

  // ── Ações ────────────────────────────────────────────────────────────────

  aceitar() {
    this.executar(this.marketplace.responder(this.id, { status: 'Accepted' }));
  }

  recusar() {
    this.executar(this.marketplace.responder(this.id, { status: 'Rejected' }));
  }

  pagar() {
    this.executar(this.marketplace.pagar(this.id, { method: this.metodoSelecionado }));
  }

  concluir() {
    this.executar(this.marketplace.concluir(this.id));
  }

  cancelar() {
    this.executar(this.marketplace.cancelar(this.id));
  }

  private executar(obs: Observable<CommercialTransactionDto>) {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    obs.pipe(finalize(() => (this.processando = false))).subscribe({
      next: (n) => (this.negociacao = n),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar a negociação.';
      },
    });
  }

  // ── Exibição ─────────────────────────────────────────────────────────────

  abrirChat() {
    if (this.negociacao) this.router.navigate(['/chat', this.negociacao.chatRoomId]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor?: string): string {
    return this.marketplace.formatarPreco(valor ?? '0');
  }

  get statusLabel(): string {
    return this.negociacao ? this.marketplace.statusNegociacaoLabel(this.negociacao.status) : '';
  }
}
