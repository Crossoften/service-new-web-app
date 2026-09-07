import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AccommodationService } from '../../../../core/services/accommodation';
import { ApiService } from '../../../../core/services/api';
import {
  AccommodationCategoryDto,
  CreateAccommodationDto,
} from '../../../../core/models/accommodation';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-criar-hospedagem',
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-hospedagem.html',
  styleUrl: './criar-hospedagem.scss',
})
export class CriarHospedagemComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AccommodationService);
  private readonly api = inject(ApiService);

  editId?: number;
  categorias: AccommodationCategoryDto[] = [];

  categoryId?: number;
  nome = '';
  preco?: number;
  quartos?: number;
  rua = '';
  bairro = '';
  cidade = '';
  estado = '';
  descricao = '';
  imageUrl = '';
  imageKey = '';
  ativa = true;

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
        .acomodacao(this.editId)
        .pipe(finalize(() => (this.carregando = false)))
        .subscribe({
          next: (a) => {
            this.categoryId = a.categoryId;
            this.nome = a.name;
            this.preco = Number(a.price);
            this.quartos = a.roomsQuantity;
            this.rua = a.street ?? '';
            this.bairro = a.neighborhood ?? '';
            this.cidade = a.city ?? '';
            this.estado = a.state ?? '';
            this.descricao = a.description ?? '';
            this.imageUrl = a.imageUrl ?? '';
            this.imageKey = a.imageKey ?? '';
            this.ativa = a.isActive;
          },
          error: (err: ApiError) => {
            this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a hospedagem.';
          },
        });
    }
  }

  get titulo(): string {
    return this.editId ? 'Editar hospedagem' : 'Nova hospedagem';
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
      this.erro = 'Informe o nome da hospedagem.';
      return;
    }
    if (this.preco === undefined || this.preco === null || isNaN(Number(this.preco)) || Number(this.preco) < 0) {
      this.erro = 'Informe um valor válido.';
      return;
    }

    const dto: CreateAccommodationDto = {
      categoryId: this.categoryId,
      name: this.nome.trim(),
      price: Number(this.preco),
      roomsQuantity: this.quartos ?? undefined,
      street: this.rua.trim() || undefined,
      neighborhood: this.bairro.trim() || undefined,
      city: this.cidade.trim() || undefined,
      state: this.estado.trim() || undefined,
      description: this.descricao.trim() || undefined,
      imageUrl: this.imageUrl || undefined,
      imageKey: this.imageKey || undefined,
      isActive: this.ativa,
    };

    this.salvando = true;
    const req$ = this.editId
      ? this.service.atualizar(this.editId, dto)
      : this.service.criar(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => this.router.navigate(['/fornecedor/hospedagem']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar a hospedagem.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
