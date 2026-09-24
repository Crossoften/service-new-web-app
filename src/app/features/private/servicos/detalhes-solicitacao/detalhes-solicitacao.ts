import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkService, Solicitacao } from '../../../../core/services/work';
import { WorkStatus } from '../../../../core/models/enums';
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

  // Garantia (fatia 1): modal de solicitação com descrição.
  mostrarModalGarantia = false;
  descricaoGarantia = '';

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
    // Reparo de garantia é sem custo (BE-W1): não há etapa de pagamento.
    if (this.solicitacao?.pago || this.ehGarantia) {
      this.router.navigate(['/servicos/solicitacoes']);
      return;
    }
    this.router.navigate(['/servicos/pagamento', this.solicitacaoId]);
  }

  /** Esta solicitação é um reparo de garantia (BE-W1): sem custo e sem re-garantia. */
  get ehGarantia(): boolean {
    return !!this.solicitacao?.ehGarantia;
  }

  /**
   * Cliente pode acionar garantia: dentro da validade, sem pedido pendente e
   * **desde que o próprio trabalho não seja um reparo** — a API recusa garantia
   * de garantia com 400 (Q-G).
   */
  get podeSolicitarGarantia(): boolean {
    return (
      !!this.solicitacao?.sobGarantia &&
      this.solicitacao?.garantiaStatus !== 'Pending' &&
      !this.ehGarantia
    );
  }

  /** Abre outra solicitação (link reparo ↔ original). */
  abrirSolicitacao(id?: number) {
    if (id) this.router.navigate(['/servicos/solicitacao', id]);
  }

  /** Rótulo curto do status de um reparo listado (warrantyWorks). */
  reparoStatusLabel(status: WorkStatus): string {
    switch (status) {
      case 'Pending':
        return 'Aguardando início';
      case 'InProgress':
        return 'Em andamento';
      case 'Finished':
        return 'Concluído';
      case 'Cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  solicitarGarantia() {
    if (!this.podeSolicitarGarantia) return;
    this.descricaoGarantia = '';
    this.erro = '';
    this.mostrarModalGarantia = true;
  }

  enviarGarantia() {
    if (this.processando) return;
    const description = this.descricaoGarantia.trim();
    if (!description) {
      this.erro = 'Descreva o problema para solicitar a garantia.';
      return;
    }
    this.processando = true;
    this.erro = '';
    this.works.solicitarGarantia(this.solicitacaoId, { description }).subscribe({
      next: () => {
        this.processando = false;
        this.mostrarModalGarantia = false;
        this.carregar();
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível solicitar a garantia.';
        this.processando = false;
      },
    });
  }

  cancelarGarantia() {
    this.mostrarModalGarantia = false;
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
