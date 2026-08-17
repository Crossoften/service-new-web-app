import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { JobDto } from '../../../core/models/job';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-listagem-empregos',
  imports: [CommonModule],
  templateUrl: './listagem-empregos.html',
  styleUrl: './listagem-empregos.scss',
})
export class ListagemEmpregosComponent implements OnInit {
  private readonly jobs = inject(JobService);
  private readonly router = inject(Router);

  vagas: JobDto[] = [];
  carregando = false;
  erro = '';

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
