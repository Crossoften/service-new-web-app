import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type StepSolicitacao = 'aguardando' | 'cancelavel' | 'em_andamento' | 'concluido';

@Component({
  selector: 'app-detalhes-solicitacao',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes-solicitacao.html',
  styleUrl: './detalhes-solicitacao.scss'
})
export class DetalhesSolicitacaoComponent implements OnInit {
  solicitacaoId: number = 0;
  stepAtual: StepSolicitacao = 'aguardando';
  mostrarModal: boolean = false;

  // Mock dados
  prestadorNome: string = 'Ricardo Silva';
  prestadorDescricao: string = 'Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit Amet, Consectetur Lorem Ipsum Dolor Sit Amet, Consectetur';

  arquivos = [
    { id: 1, nome: 'ARQUIVO.PDF', tipo: 'pdf' },
    { id: 2, nome: 'ARQUIVO.MP3', tipo: 'mp3' },
    { id: 3, nome: 'ARQUIVO.MP4', tipo: 'mp4' },
  ];

  steps: StepSolicitacao[] = ['aguardando', 'cancelavel', 'em_andamento', 'concluido'];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.solicitacaoId = Number(this.route.snapshot.paramMap.get('id'));
    const step = this.route.snapshot.queryParamMap.get('step') as StepSolicitacao;
    if (step) this.stepAtual = step;
  }

  finalizar() {
    this.mostrarModal = true;
  }

  revisao() {
    // implementar depois
  }

  cancelar() {
    this.router.navigate(['/servicos/solicitacoes']);
  }

  confirmarChegada() {
    this.stepAtual = 'concluido';
  }

  servicoConcluido() {
    this.router.navigate(['/servicos/pagamento', this.solicitacaoId]);
  }

  solicitarGarantia() {
    // implementar depois
  }

  confirmarModal() {
    this.mostrarModal = false;
    this.router.navigate(['/servicos/pagamento', this.solicitacaoId]);
  }

  cancelarModal() {
    this.mostrarModal = false;
  }

  abrirChat() {
    this.router.navigate(['/servicos/chat', this.solicitacaoId]);
  }

  voltar() {
    history.back();
  }
}