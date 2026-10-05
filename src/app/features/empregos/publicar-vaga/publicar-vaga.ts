import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class PublicarVagaComponent implements OnInit {
  private readonly jobs = inject(JobService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tipos: { id: JobType; label: string }[] = [
    { id: 'CLT', label: 'CLT' },
    { id: 'PJ', label: 'PJ' },
    { id: 'Freelance', label: 'Freelance' },
    { id: 'Temporary', label: 'Temporário' },
  ];

  /** Definido quando a tela está em modo edição (rota `/empregos/vaga/:id/editar`). */
  editId?: number;

  titulo = '';
  tipo: JobType = 'CLT';
  valor?: number;
  requisitos = '';
  descricao = '';

  carregando = false;
  salvando = false;
  erro = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.editId = Number(id);
    this.carregando = true;
    this.jobs
      .vaga(this.editId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (v) => {
          this.titulo = v.title;
          this.tipo = v.type;
          this.valor = v.value != null ? Number(v.value) : undefined;
          this.requisitos = v.requirements ?? '';
          this.descricao = v.description ?? '';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a vaga.';
        },
      });
  }

  /** Título da tela conforme o modo. */
  get tituloTela(): string {
    return this.editId ? 'Editar vaga' : 'Publicar vaga';
  }

  salvar() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.titulo.trim()) {
      this.erro = 'Informe o título da vaga.';
      return;
    }
    this.salvando = true;
    const dto = {
      title: this.titulo.trim(),
      type: this.tipo,
      value: this.valor || undefined,
      requirements: this.requisitos.trim() || undefined,
      description: this.descricao.trim() || undefined,
    };
    const req$ = this.editId
      ? this.jobs.atualizarVaga(this.editId, dto)
      : this.jobs.criarVaga(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      // Edição volta à gestão do empregador; publicação nova segue como antes.
      next: () => this.router.navigate([this.editId ? '/empregos/minhas-vagas' : '/empregos/vagas']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim()
          ? err.message
          : this.editId
            ? 'Não foi possível salvar a vaga.'
            : 'Não foi possível publicar a vaga.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
