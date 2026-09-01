import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { WorkService, TrabalhoFornecedor } from '../../../../core/services/work';
import { ApiError } from '../../../../core/models/common';

export type StepTrabalho = 'inicial' | 'em_andamento' | 'concluido';

@Component({
  selector: 'app-detalhes-trabalho',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes-trabalho.html',
  styleUrl: './detalhes-trabalho.scss'
})
export class DetalhesTrabalhoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly works = inject(WorkService);

  trabalhoId = 0;
  trabalho?: TrabalhoFornecedor;
  stepAtual: StepTrabalho = 'inicial';
  mostrarModalAcrescimo = false;
  processando = false;
  erro = '';

  // Resposta do fornecedor (descrição de conclusão)
  respostaDescricao = '';
  respostaArquivos: { id: number; nome: string; tipo: string }[] = [];

  // Modal acréscimo
  justificativa = '';
  valorAcrescimo = '';

  ngOnInit() {
    this.trabalhoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  private carregar() {
    this.works.trabalho(this.trabalhoId).subscribe({
      next: (t) => {
        this.trabalho = t;
        this.stepAtual = this.stepDe(t);
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o trabalho.';
      },
    });
  }

  private stepDe(t: TrabalhoFornecedor): StepTrabalho {
    switch (t.statusApi) {
      case 'Pending':
        return 'inicial';
      case 'InProgress':
        return 'em_andamento';
      default: // Finished, Cancelled
        return 'concluido';
    }
  }

  iniciarServico() {
    // Abre o modal que pergunta sobre acréscimo antes de iniciar.
    this.mostrarModalAcrescimo = true;
  }

  confirmarAcrescimo() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    const valor = Number(this.valorAcrescimo);
    const description = this.justificativa.trim();
    const temAcrescimo = description.length > 0 && Number.isFinite(valor) && valor > 0;

    this.works
      .iniciar(this.trabalhoId)
      .pipe(
        switchMap(() =>
          temAcrescimo
            ? this.works.solicitarAcrescimo(this.trabalhoId, { description, value: valor })
            : of(null),
        ),
      )
      .subscribe({
        next: () => {
          this.mostrarModalAcrescimo = false;
          this.processando = false;
          this.carregar();
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível iniciar o serviço.';
          this.processando = false;
          this.mostrarModalAcrescimo = false;
        },
      });
  }

  /** Envia a conclusão do serviço (finish). */
  enviarResposta() {
    if (this.processando) return;
    const completionDescription = this.respostaDescricao.trim();
    if (!completionDescription) {
      this.erro = 'Descreva o serviço executado para finalizar.';
      return;
    }
    this.processando = true;
    this.erro = '';
    this.works.finalizar(this.trabalhoId, { completionDescription }).subscribe({
      next: () => this.router.navigate(['/fornecedor/servicos/trabalhos']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível finalizar o serviço.';
        this.processando = false;
      },
    });
  }

  finalizarServico() {
    // Trabalho já concluído — retorna à lista.
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  cancelar() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.works.cancelar(this.trabalhoId, { cancelReason: 'Cancelado pelo fornecedor.' }).subscribe({
      next: () => this.router.navigate(['/fornecedor/servicos/trabalhos']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível cancelar o trabalho.';
        this.processando = false;
      },
    });
  }

  adicionarArquivo() {
    // Upload de anexos de conclusão em fatia posterior.
  }

  abrirChat() {
    const chatId = this.trabalho?.chatId;
    if (chatId) this.router.navigate(['/chat', chatId]);
  }

  voltar() {
    history.back();
  }
}
