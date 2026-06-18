import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorServicosService, TrabalhoFornecedor, StatusTrabalho } from '../../../../core/services/fornecedor-servicos';

export type StepTrabalho = 'inicial' | 'em_andamento' | 'concluido';

@Component({
  selector: 'app-detalhes-trabalho',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhes-trabalho.html',
  styleUrl: './detalhes-trabalho.scss'
})
export class DetalhesTrabalhoComponent implements OnInit {
  trabalho?: TrabalhoFornecedor;
  stepAtual: StepTrabalho = 'inicial';
  mostrarModalAcrescimo: boolean = false;

  // Resposta do fornecedor
  respostaDescricao: string = '';
  respostaArquivos = [
    { id: 1, nome: 'ARQUIVO.PDF', tipo: 'pdf' },
    { id: 2, nome: 'ARQUIVO.MP3', tipo: 'mp3' },
    { id: 3, nome: 'ARQUIVO.MP4', tipo: 'mp4' },
  ];

  // Modal acréscimo
  justificativa: string = '';
  valorAcrescimo: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorServicosService: FornecedorServicosService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.trabalho = this.fornecedorServicosService.getTrabalho(id);

    const step = this.route.snapshot.queryParamMap.get('step') as StepTrabalho;
    if (step) this.stepAtual = step;
  }

  iniciarServico() {
    this.mostrarModalAcrescimo = true;
  }

  confirmarAcrescimo() {
    this.mostrarModalAcrescimo = false;
    this.stepAtual = 'em_andamento';
    if (this.trabalho) {
      this.fornecedorServicosService.atualizarStatusTrabalho(this.trabalho.id, 'em_andamento');
    }
  }

  finalizarServico() {
    if (this.trabalho) {
      this.fornecedorServicosService.atualizarStatusTrabalho(this.trabalho.id, 'finalizado');
    }
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  cancelar() {
    if (this.trabalho) {
      this.fornecedorServicosService.atualizarStatusTrabalho(this.trabalho.id, 'cancelado');
    }
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  enviarResposta() {
    // Futuramente: enviar resposta ao cliente
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  adicionarArquivo() {
    // Futuramente: abrir file picker
  }

  abrirChat() {
    this.router.navigate(['/servicos/chat', this.trabalho?.id]);
  }

  voltar() {
    history.back();
  }
}