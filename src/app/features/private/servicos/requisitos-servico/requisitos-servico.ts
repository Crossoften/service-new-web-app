import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { ServiceCatalogService } from '../../../../core/services/service-catalog';
import { ApiError } from '../../../../core/models/common';

interface Arquivo {
  id: number;
  nome: string;
  tipo: string;
}

@Component({
  selector: 'app-requisitos-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './requisitos-servico.html',
  styleUrl: './requisitos-servico.scss',
})
export class RequisitosServicoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(ServiceCatalogService);

  descricao = '';
  tipoServico = 'Urgente';
  tiposServico = ['Urgente', 'Normal', 'Agendado'];
  tipoAberto = false;
  erro = '';
  enviando = false;

  private serviceIds: number[] = [];

  arquivos: Arquivo[] = [];

  ngOnInit() {
    const ids = this.route.snapshot.queryParamMap.get('ids') ?? '';
    this.serviceIds = ids
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);
  }

  toggleTipo() {
    this.tipoAberto = !this.tipoAberto;
  }

  selecionarTipo(tipo: string) {
    this.tipoServico = tipo;
    this.tipoAberto = false;
  }

  adicionarArquivo() {
    // Upload real de anexos será tratado em fatia posterior (POST /upload/one-file).
  }

  removerArquivo(id: number) {
    this.arquivos = this.arquivos.filter((a) => a.id !== id);
  }

  confirmar() {
    if (this.enviando) return;
    this.erro = '';
    if (!this.descricao.trim()) {
      this.erro = 'Descreva sua solicitação.';
      return;
    }
    if (!this.serviceIds.length) {
      this.erro = 'Nenhum prestador selecionado.';
      return;
    }
    const descricao = `[${this.tipoServico}] ${this.descricao.trim()}`;
    this.enviando = true;
    forkJoin(
      this.serviceIds.length
        ? this.serviceIds.map((serviceId) => this.catalog.solicitarOrcamento({ serviceId, description: descricao }))
        : [of(null)],
    )
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: () => this.router.navigate(['/servicos/orcamentos']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a solicitação.';
        },
      });
  }

  voltar() {
    history.back();
  }
}
