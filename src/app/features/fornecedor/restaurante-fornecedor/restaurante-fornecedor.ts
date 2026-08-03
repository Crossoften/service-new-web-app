import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../../core/services/fornecedor';
import { DeliveryService } from '../../../core/services/delivery';
import { ResponseRestaurantCategoryDto, ResponseRestaurantDto } from '../../../core/models/restaurant';
import { ApiError } from '../../../core/models/common';

/**
 * Cadastro/edição do restaurante do fornecedor (onboarding).
 * Cria via `POST /restaurants` ou edita via `PATCH /restaurants/{id}` (inclui abrir/fechar).
 */
@Component({
  selector: 'app-restaurante-fornecedor',
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurante-fornecedor.html',
  styleUrl: './restaurante-fornecedor.scss',
})
export class RestauranteFornecedorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly deliveryService = inject(DeliveryService);

  restaurante: ResponseRestaurantDto | null = null;
  categorias: ResponseRestaurantCategoryDto[] = [];

  nome = '';
  descricao = '';
  categoriaId: number | null = null;
  categoriaAberta = false;
  aberto = true;

  carregando = false;
  salvando = false;
  erro = '';

  get modoEdicao(): boolean {
    return this.restaurante !== null;
  }

  ngOnInit() {
    this.carregando = true;
    this.deliveryService.getCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats ?? [];
        if (this.categoriaId == null && this.categorias.length) {
          this.categoriaId = this.categorias[0].id;
        }
      },
    });
    this.fornecedorService.meuRestaurante().subscribe({
      next: (r) => {
        this.carregando = false;
        if (r) this.aplicar(r);
      },
      error: () => (this.carregando = false),
    });
  }

  private aplicar(r: ResponseRestaurantDto) {
    this.restaurante = r;
    this.nome = r.name;
    this.descricao = r.description ?? '';
    this.categoriaId = r.category?.id ?? this.categoriaId;
    this.aberto = r.isOpen;
  }

  get categoriaLabel(): string {
    return this.categorias.find((c) => c.id === this.categoriaId)?.name ?? 'Selecione';
  }

  toggleCategoria() {
    this.categoriaAberta = !this.categoriaAberta;
  }

  selecionarCategoria(cat: ResponseRestaurantCategoryDto) {
    this.categoriaId = cat.id;
    this.categoriaAberta = false;
  }

  toggleAberto() {
    this.aberto = !this.aberto;
  }

  salvar() {
    this.erro = '';
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do restaurante.';
      return;
    }
    if (this.categoriaId == null) {
      this.erro = 'Selecione uma categoria.';
      return;
    }
    this.salvando = true;

    if (this.restaurante) {
      this.fornecedorService
        .atualizarRestaurante(this.restaurante.id, {
          name: this.nome.trim(),
          description: this.descricao.trim() || undefined,
          categoryId: this.categoriaId,
          isOpen: this.aberto,
        })
        .subscribe({ next: () => this.concluir(), error: (e: ApiError) => this.falhar(e) });
    } else {
      this.fornecedorService
        .criarRestaurante({
          name: this.nome.trim(),
          categoryId: this.categoriaId,
          description: this.descricao.trim() || undefined,
        })
        .subscribe({ next: () => this.concluir(), error: (e: ApiError) => this.falhar(e) });
    }
  }

  private concluir() {
    this.salvando = false;
    this.router.navigate(['/fornecedor/cardapio']);
  }

  private falhar(err: ApiError) {
    this.salvando = false;
    this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o restaurante.';
  }

  voltar() {
    history.back();
  }
}
