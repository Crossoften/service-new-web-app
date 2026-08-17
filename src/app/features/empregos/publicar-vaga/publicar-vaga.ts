import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { JobService } from '../../../core/services/job';
import { JobType } from '../../../core/models/job';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-publicar-vaga',
  imports: [CommonModule, FormsModule],
  templateUrl: './publicar-vaga.html',
  styleUrl: './publicar-vaga.scss',
})
export class PublicarVagaComponent {
  private readonly jobs = inject(JobService);
  private readonly router = inject(Router);

  tipos: { id: JobType; label: string }[] = [
    { id: 'CLT', label: 'CLT' },
    { id: 'PJ', label: 'PJ' },
    { id: 'Freelance', label: 'Freelance' },
    { id: 'Temporary', label: 'Temporário' },
  ];

  titulo = '';
  tipo: JobType = 'CLT';
  valor?: number;
  requisitos = '';
  descricao = '';

  salvando = false;
  erro = '';

  salvar() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.titulo.trim()) {
      this.erro = 'Informe o título da vaga.';
      return;
    }
    this.salvando = true;
    this.jobs
      .criarVaga({
        title: this.titulo.trim(),
        type: this.tipo,
        value: this.valor || undefined,
        requirements: this.requisitos.trim() || undefined,
        description: this.descricao.trim() || undefined,
      })
      .pipe(finalize(() => (this.salvando = false)))
      .subscribe({
        next: () => this.router.navigate(['/empregos/vagas']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível publicar a vaga.';
        },
      });
  }

  voltar() {
    history.back();
  }
}
