import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { JobDto, JobType } from '../../../core/models/job';
import { ApiError } from '../../../core/models/common';

type FiltroTipo = JobType | 'todos';

@Component({
  selector: 'app-listagem-empregos',
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-empregos.html',
  styleUrl: './listagem-empregos.scss',
})
export class ListagemEmpregosComponent implements OnInit {
  private readonly jobs = inject(JobService);
  private readonly router = inject(Router);

  vagas: JobDto[] = [];
  carregando = false;
  erro = '';

  // Busca + filtros (VF-3)
  busca = '';
  filtroTipo: FiltroTipo = 'todos';
  maisRecentes = false;

  readonly tipos: { id: FiltroTipo; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'CLT', label: 'CLT' },
    { id: 'PJ', label: 'PJ' },
    { id: 'Freelance', label: 'Freelance' },
    { id: 'Temporary', label: 'Temporário' },
  ];

  ngOnInit() {
    this.carregando = true;
    this.jobs
      .vagas({ scope: 'All', isActive: true })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.vagas = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as vagas.';
        },
      });
  }

  /** Busca (título/empresa) + filtro por tipo + ordenação por data (mais recentes). */
  get vagasFiltradas(): JobDto[] {
    const t = this.busca.trim().toLowerCase();
    const lista = this.vagas.filter((v) => {
      if (t && !(v.title.toLowerCase().includes(t) || v.employer.name.toLowerCase().includes(t))) {
        return false;
      }
      if (this.filtroTipo !== 'todos' && v.type !== this.filtroTipo) return false;
      return true;
    });
    return this.maisRecentes
      ? [...lista].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : lista;
  }

  selecionarTipo(id: FiltroTipo) {
    this.filtroTipo = id;
  }

  toggleRecentes() {
    this.maisRecentes = !this.maisRecentes;
  }

  abrir(id: number) {
    this.router.navigate(['/empregos/vaga', id]);
  }

  publicar() {
    this.router.navigate(['/empregos/vaga/nova']);
  }

  minhasCandidaturas() {
    this.router.navigate(['/empregos/candidaturas']);
  }

  voltar() {
    history.back();
  }

  tipoLabel(v: JobDto): string {
    return this.jobs.tipoLabel(v.type);
  }

  formatarPreco(valor?: string): string {
    return this.jobs.formatarPreco(valor);
  }
}
