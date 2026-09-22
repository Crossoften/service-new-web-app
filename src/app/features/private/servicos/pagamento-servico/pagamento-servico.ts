import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkService, Solicitacao } from '../../../../core/services/work';
import { ApiError } from '../../../../core/models/common';

/**
 * Pagamento do serviço concluído. O back gera um **checkout Mercado Pago** com
 * split (`POST /works/{id}/pay` → `{ checkoutUrl }`) e a confirmação vem depois
 * por webhook — aqui apenas redirecionamos o cliente ao checkout. O método de
 * pagamento é escolhido na própria página do Mercado Pago (não há seleção local).
 */
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
  processando = false;
  erro = '';

  ngOnInit() {
    this.solicitacaoId = Number(this.route.snapshot.paramMap.get('id'));
    this.works.solicitacao(this.solicitacaoId).subscribe({
      next: (s) => (this.solicitacao = s),
      error: () => {
        /* Segue exibindo a tela mesmo sem os detalhes carregados. */
      },
    });
  }

  /** Só permite pagar um trabalho concluído e ainda não pago. */
  get podePagar(): boolean {
    return this.solicitacao?.statusApi === 'Finished' && !this.solicitacao?.pago;
  }

  efetuarPagamento() {
    if (this.processando || (this.solicitacao && !this.podePagar)) return;
    this.processando = true;
    this.erro = '';
    this.works.pagar(this.solicitacaoId).subscribe({
      next: (res) => {
        // Leva o cliente ao checkout do Mercado Pago. A confirmação chega por
        // webhook; ao voltar, a lista/detalhe reconsulta e o pagamento aparece.
        window.location.href = res.checkoutUrl;
      },
      error: (err: ApiError) => {
        // Travas do back (já pago, não concluído, fornecedor sem conta MP vinculada):
        // mostra a mensagem da API.
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível iniciar o pagamento.';
        this.processando = false;
      },
    });
  }

  voltar() {
    history.back();
  }
}
