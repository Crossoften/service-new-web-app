import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { SessionService } from '../../../core/services/session';
import { JobDto } from '../../../core/models/job';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-detalhe-vaga',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhe-vaga.html',
  styleUrl: './detalhe-vaga.scss',
})
export class DetalheVagaComponent implements OnInit {
  private readonly jobs = inject(JobService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  vagaId = 0;
  vaga?: JobDto;
  carregando = false;
  processando = false;
  erro = '';
  sucesso = '';
  mensagem = '';

  ngOnInit() {
    this.vagaId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.jobs
      .vaga(this.vagaId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (v) => (this.vaga = v),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a vaga.';
        },
      });
  }

  get souEmpregador(): boolean {
    return !!this.vaga && this.session.userId() === this.vaga.employer.id;
  }

  candidatar() {
    if (!this.vaga || this.processando) return;
    this.processando = true;
    this.erro = '';
    this.jobs
      .candidatar(this.vagaId, { message: this.mensagem.trim() || undefined })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Candidatura enviada! O empregador foi notificado.';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a candidatura.';
        },
      });
  }

  verCandidaturas() {
    this.router.navigate(['/empregos/vaga', this.vagaId, 'candidaturas']);
  }

  verMinhasCandidaturas() {
    this.router.navigate(['/empregos/candidaturas']);
  }

  voltar() {
    history.back();
  }

  get tipoLabel(): string {
    return this.vaga ? this.jobs.tipoLabel(this.vaga.type) : '';
  }

  formatarPreco(valor?: string): string {
    return this.jobs.formatarPreco(valor);
  }
}
