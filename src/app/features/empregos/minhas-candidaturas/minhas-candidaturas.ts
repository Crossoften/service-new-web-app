import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { JobApplicationDto } from '../../../core/models/job-application';
import { ApiError } from '../../../core/models/common';

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

  voltar() {
    history.back();
  }

  statusLabel(c: JobApplicationDto): string {
    return this.jobs.statusCandidaturaLabel(c.status);
  }
}
