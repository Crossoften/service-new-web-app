import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkService, Solicitacao } from '../../../../core/services/work';
import { PaymentMethod } from '../../../../core/models/enums';
import { ApiError } from '../../../../core/models/common';

type FormaPagamento = 'credito' | 'debito' | 'pix' | 'dinheiro';

@Component({
  selector: 'app-pagamento-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagamento-servico.html',
  styleUrl: './pagamento-servico.scss'
})
export class PagamentoServicoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly works = inject(WorkService);

  solicitacaoId = 0;
  solicitacao?: Solicitacao;
  formaSelecionada: FormaPagamento = 'credito';
  formaPagamentoAberta = false;
  processando = false;
  erro = '';

  formasPagamento: { id: FormaPagamento; label: string }[] = [
    { id: 'credito',  label: 'Cartão de Crédito' },
    { id: 'debito',   label: 'Cartão de Débito' },
    { id: 'pix',      label: 'PIX' },
    { id: 'dinheiro', label: 'Dinheiro' },
  ];

  /** Mapeia a forma da UI para o método aceito pela API (CreditCard|Pix|BankSlip). */
  private readonly metodoApi: Record<FormaPagamento, PaymentMethod> = {
    credito: 'CreditCard',
    debito: 'CreditCard',
    pix: 'Pix',
    dinheiro: 'BankSlip',
  };

  ngOnInit() {
    this.solicitacaoId = Number(this.route.snapshot.paramMap.get('id'));
    this.works.solicitacao(this.solicitacaoId).subscribe({
      next: (s) => (this.solicitacao = s),
      error: () => {
        /* Segue exibindo a tela mesmo sem os detalhes carregados. */
      },
    });
  }

  get formaSelecionadaLabel(): string {
    return this.formasPagamento.find(f => f.id === this.formaSelecionada)?.label ?? '';
  }

  togglePagamento() {
    this.formaPagamentoAberta = !this.formaPagamentoAberta;
  }

  selecionarForma(forma: FormaPagamento) {
    this.formaSelecionada = forma;
    this.formaPagamentoAberta = false;
  }

  efetuarPagamento() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.works.pagar(this.solicitacaoId, { method: this.metodoApi[this.formaSelecionada] }).subscribe({
      next: () => this.router.navigate(['/servicos/solicitacoes']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível efetuar o pagamento.';
        this.processando = false;
      },
    });
  }

  voltar() {
    history.back();
  }
}
