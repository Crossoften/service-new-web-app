import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { JobApplicationDto, JobApplicationStatus } from '../../../core/models/job-application';
import { ApiError } from '../../../core/models/common';

/** Candidaturas "ativas" = ainda em jogo (não terminais). O resto é histórico. */
const STATUS_ATIVOS: JobApplicationStatus[] = ['Applied', 'Accepted'];

type AbaCandidaturas = 'ativos' | 'historico';

@Component({
  selector: 'app-minhas-candidaturas',
  imports: [CommonModule],
  templateUrl: './minhas-candidaturas.html',
  styleUrl: './minhas-candidaturas.scss',
})
export class MinhasCandidaturasComponent implements OnInit {
  private readonly jobs = inject(JobService);

  candidaturas: JobApplicationDto[] = [];
  carregando = false;
  erro = '';
  aba: AbaCandidaturas = 'ativos';

  ngOnInit() {
    this.carregando = true;
    this.jobs
      .minhasCandidaturas()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.candidaturas = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar suas candidaturas.';
        },
      });
  }

  ehAtivo(c: JobApplicationDto): boolean {
    return STATUS_ATIVOS.includes(c.status);
  }

  selecionarAba(aba: AbaCandidaturas) {
    this.aba = aba;
  }

  /** Candidaturas da aba atual: ativas (em jogo) ou histórico (terminais). */
  get candidaturasFiltradas(): JobApplicationDto[] {
    const querAtivos = this.aba === 'ativos';
    return this.candidaturas.filter((c) => this.ehAtivo(c) === querAtivos);
  }

  voltar() {
    history.back();
  }

  statusLabel(c: JobApplicationDto): string {
    return this.jobs.statusCandidaturaLabel(c.status);
  }
}
