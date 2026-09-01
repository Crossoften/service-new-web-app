import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkService, Solicitacao } from '../../../../core/services/work';
import { ApiError } from '../../../../core/models/common';

export type StepSolicitacao = 'aguardando' | 'cancelavel' | 'em_andamento' | 'concluido' | 'cancelado';

@Component({
  selector: 'app-detalhes-solicitacao',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes-solicitacao.html',
  styleUrl: './detalhes-solicitacao.scss'
})
export class DetalhesSolicitacaoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly works = inject(WorkService);

  solicitacaoId = 0;
  solicitacao?: Solicitacao;
  stepAtual: StepSolicitacao = 'aguardando';
  mostrarModal = false;
  processando = false;
  erro = '';

  ngOnInit() {
    this.solicitacaoId = Number(this.route.snapshot.paramMap.get('id'));
    const stepHint = this.route.snapshot.queryParamMap.get('step') as StepSolicitacao | null;
    if (stepHint) this.stepAtual = stepHint;
    this.carregar();
  }

  private carregar() {
    this.works.solicitacao(this.solicitacaoId).subscribe({
      next: (s) => {
        this.solicitacao = s;
        this.stepAtual = this.stepDe(s);
        if (s.extraPendente) this.mostrarModal = true;
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a solicitação.';
      },
    });
  }

  private stepDe(s: Solicitacao): StepSolicitacao {
    switch (s.statusApi) {
      case 'Pending':
        return 'cancelavel';
      case 'InProgress':
        return 'em_andamento';
      case 'Finished':
        return 'concluido';
      default: // Cancelled
        return 'cancelado';
    }
  }

  finalizar() {
    // Reservado para responder ao acréscimo (quando houver pendência).
    if (this.solicitacao?.extraPendente) this.mostrarModal = true;
  }

  revisao() {
    // Avaliação do serviço será implementada em fatia posterior.
  }

  cancelar() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.works.cancelar(this.solicitacaoId, { cancelReason: 'Cancelado pelo cliente.' }).subscribe({
      next: () => this.router.navigate(['/servicos/solicitacoes']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível cancelar a solicitação.';
        this.processando = false;
      },
    });
  }

  confirmarChegada() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.works.confirmarChegada(this.solicitacaoId).subscribe({
      next: () => {
        this.processando = false;
        this.carregar();
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível confirmar a chegada.';
        this.processando = false;
      },
    });
  }

  servicoConcluido() {
    if (this.solicitacao?.pago) {
      this.router.navigate(['/servicos/solicitacoes']);
      return;
    }
    this.router.navigate(['/servicos/pagamento', this.solicitacaoId]);
  }

  solicitarGarantia() {
    const description = window.prompt('Descreva o problema para solicitar a garantia:');
    if (!description || !description.trim()) return;
    this.processando = true;
    this.erro = '';
    this.works.solicitarGarantia(this.solicitacaoId, { description: description.trim() }).subscribe({
      next: () => {
        this.processando = false;
        this.carregar();
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível solicitar a garantia.';
        this.processando = false;
      },
    });
  }

  confirmarModal() {
    // Cliente aprova o acréscimo solicitado pelo fornecedor.
    this.processando = true;
    this.works.responderAcrescimo(this.solicitacaoId, { status: 'Approved' }).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.processando = false;
        this.carregar();
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível responder ao acréscimo.';
        this.processando = false;
      },
    });
  }

  recusarModal() {
    this.processando = true;
    this.works.responderAcrescimo(this.solicitacaoId, { status: 'Rejected' }).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.processando = false;
        this.carregar();
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível responder ao acréscimo.';
        this.processando = false;
      },
    });
  }

  cancelarModal() {
    this.mostrarModal = false;
  }

  abrirChat() {
    const chatId = this.solicitacao?.chatId;
    if (chatId) this.router.navigate(['/chat', chatId]);
  }

  voltar() {
    history.back();
  }
}
