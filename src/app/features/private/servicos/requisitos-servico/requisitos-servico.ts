import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicosService, Arquivo } from '../../../../core/services/servicos';

@Component({
  selector: 'app-requisitos-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './requisitos-servico.html',
  styleUrl: './requisitos-servico.scss'
})
export class RequisitosServicoComponent {
  descricao: string = '';
  tipoServico: string = 'Urgente';
  tiposServico: string[] = ['Urgente', 'Normal', 'Agendado'];
  tipoAberto: boolean = false;
  erro: string = '';

  arquivos: Arquivo[] = [
    { id: 1, nome: 'ARQUIVO.PDF', tipo: 'pdf' },
    { id: 2, nome: 'ARQUIVO.MP3', tipo: 'mp3' },
    { id: 3, nome: 'ARQUIVO.MP4', tipo: 'mp4' },
  ];

  constructor(
    private router: Router,
    private servicosService: ServicosService
  ) {}

  toggleTipo() {
    this.tipoAberto = !this.tipoAberto;
  }

  selecionarTipo(tipo: string) {
    this.tipoServico = tipo;
    this.tipoAberto = false;
  }

  adicionarArquivo() {
    // Futuramente: abrir file picker
    const novoArquivo: Arquivo = {
      id: this.arquivos.length + 1,
      nome: `ARQUIVO_${this.arquivos.length + 1}.PDF`,
      tipo: 'pdf'
    };
    this.arquivos.push(novoArquivo);
  }

  removerArquivo(id: number) {
    this.arquivos = this.arquivos.filter(a => a.id !== id);
  }

  confirmar() {
    if (!this.descricao.trim()) {
      this.erro = 'Descreva sua solicitação.';
      return;
    }
    this.servicosService.setRequisitos({
      descricao: this.descricao,
      arquivos: this.arquivos,
      tipoServico: this.tipoServico
    });
    this.router.navigate(['/servicos/orcamentos']);
  }

  voltar() {
    history.back();
  }
}