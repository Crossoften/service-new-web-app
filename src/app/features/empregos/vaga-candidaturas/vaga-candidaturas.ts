import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { JobApplicationDto } from '../../../core/models/job-application';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-vaga-candidaturas',
  imports: [CommonModule],
  templateUrl: './vaga-candidaturas.html',
  styleUrl: './vaga-candidaturas.scss',
})
export class VagaCandidaturasComponent implements OnInit {
  private readonly jobs = inject(JobService);
  private readonly route = inject(ActivatedRoute);

  vagaId = 0;
  candidaturas: JobApplicationDto[] = [];
  carregando = false;
  processandoId?: number;
  erro = '';

  ngOnInit() {
    this.vagaId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.jobs
      .candidaturasDaVaga(this.vagaId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.candidaturas = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as candidaturas.';
        },
      });
  }

  aceitar(c: JobApplicationDto) {
    this.responder(c, 'Accepted');
  }
  recusar(c: JobApplicationDto) {
    this.responder(c, 'Rejected');
  }

  private responder(c: JobApplicationDto, status: 'Accepted' | 'Rejected') {
    if (this.processandoId) return;
    this.processandoId = c.id;
    this.erro = '';
    this.jobs
      .responderCandidatura(c.id, { status })
      .pipe(finalize(() => (this.processandoId = undefined)))
      .subscribe({
        next: (atualizada) => {
          this.candidaturas = this.candidaturas.map((x) => (x.id === atualizada.id ? atualizada : x));
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível responder a candidatura.';
        },
      });
  }

  voltar() {
    history.back();
  }

  statusLabel(c: JobApplicationDto): string {
    return this.jobs.statusCandidaturaLabel(c.status);
  }
}
