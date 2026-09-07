import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TransportService } from '../../../../core/services/transport';
import { ApiService } from '../../../../core/services/api';
import {
  CreateTransportationDto,
  TransportationCategoryDto,
} from '../../../../core/models/transportation';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-criar-transporte',
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-transporte.html',
  styleUrl: './criar-transporte.scss',
})
export class CriarTransporteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TransportService);
  private readonly api = inject(ApiService);

  editId?: number;
  categorias: TransportationCategoryDto[] = [];

  categoryId?: number;
  nome = '';
  preco?: number;
  modelo = '';
  ano?: number;
  quilometragem?: number;
  capacidade?: number;
  descricao = '';
  imageUrl = '';
  imageKey = '';
  ativo = true;

  carregando = false;
  salvando = false;
  enviandoFoto = false;
  erro = '';

  ngOnInit() {
    this.service.categorias().subscribe({
      next: (cats) => (this.categorias = cats),
      error: () => {},
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.editId = Number(id);
      this.carregando = true;
      this.service
        .transporte(this.editId)
        .pipe(finalize(() => (this.carregando = false)))
        .subscribe({
          next: (t) => {
            this.categoryId = t.categoryId;
            this.nome = t.name;
            this.preco = Number(t.price);
            this.modelo = t.model ?? '';
            this.ano = t.year;
            this.quilometragem = t.mileageKm;
            this.capacidade = t.capacity;
            this.descricao = t.description ?? '';
            this.imageUrl = t.imageUrl ?? '';
            this.imageKey = t.imageKey ?? '';
            this.ativo = t.isActive;
          },
          error: (err: ApiError) => {
            this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o transporte.';
          },
        });
    }
  }

  get titulo(): string {
    return this.editId ? 'Editar transporte' : 'Novo transporte';
  }

  adicionarImagem(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.enviandoFoto = true;
    this.erro = '';
    this.api
      .uploadOne(file)
      .pipe(finalize(() => (this.enviandoFoto = false)))
      .subscribe({
        next: (res) => {
          this.imageUrl = res.fileUrl;
          this.imageKey = res.fileKey;
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a imagem.';
        },
      });
  }

  salvar() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.categoryId) {
      this.erro = 'Selecione a categoria.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do transporte.';
      return;
    }
    if (this.preco === undefined || this.preco === null || isNaN(Number(this.preco)) || Number(this.preco) < 0) {
      this.erro = 'Informe um valor válido.';
      return;
    }

    const dto: CreateTransportationDto = {
      categoryId: this.categoryId,
      name: this.nome.trim(),
      price: Number(this.preco),
      model: this.modelo.trim() || undefined,
      year: this.ano ?? undefined,
      mileageKm: this.quilometragem ?? undefined,
      capacity: this.capacidade ?? undefined,
      description: this.descricao.trim() || undefined,
      imageUrl: this.imageUrl || undefined,
      imageKey: this.imageKey || undefined,
      isActive: this.ativo,
    };

    this.salvando = true;
    const req$ = this.editId
      ? this.service.atualizar(this.editId, dto)
      : this.service.criar(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => this.router.navigate(['/fornecedor/transporte']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o transporte.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
