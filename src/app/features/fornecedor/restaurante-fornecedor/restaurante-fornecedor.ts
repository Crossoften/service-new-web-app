import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
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
  carregandoCategorias = false;
  erroCategorias = false;
  salvando = false;
  erro = '';
  aviso = '';
  precisaAssinatura = false;

  get modoEdicao(): boolean {
    return this.restaurante !== null;
  }

  ngOnInit() {
    this.carregarCategorias();
    this.carregarRestaurante();
  }

  /** Carrega as categorias de restaurante (com timeout e opção de retry). */
  carregarCategorias() {
    this.carregandoCategorias = true;
    this.erroCategorias = false;
    this.deliveryService
      .getCategorias()
      .pipe(
        timeout(10000),
        finalize(() => (this.carregandoCategorias = false)),
      )
      .subscribe({
        next: (cats) => {
          this.categorias = cats ?? [];
          if (this.categoriaId == null && this.categorias.length) {
            this.categoriaId = this.categorias[0].id;
          }
          this.erroCategorias = this.categorias.length === 0;
        },
        error: () => (this.erroCategorias = true),
      });
  }

  private carregarRestaurante() {
    this.carregando = true;
    this.fornecedorService
      .meuRestaurante()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (r) => {
          if (r) this.aplicar(r);
        },
        error: () => {},
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
    this.aviso = '';
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do restaurante.';
      return;
    }
    if (this.categoriaId == null) {
      this.erro = this.categorias.length ? 'Selecione uma categoria.' : 'Não foi possível carregar as categorias. Tente novamente.';
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
        .subscribe({
          next: (r) => {
            this.salvando = false;
            this.aplicar(r);
            this.aviso = 'Restaurante atualizado.';
          },
          error: (e: ApiError) => this.falhar(e),
        });
    } else {
      this.fornecedorService
        .criarRestaurante({
          name: this.nome.trim(),
          categoryId: this.categoriaId,
          description: this.descricao.trim() || undefined,
        })
        .subscribe({
          next: (res) => {
            this.salvando = false;
            // Usa o restaurante retornado pelo POST — não depende do /me (que pode demorar a refletir).
            if (res?.restaurant) this.aplicar(res.restaurant);
            this.aviso = 'Restaurante criado com sucesso!';
          },
          error: (e: ApiError) => this.falhar(e),
        });
    }
  }

  private falhar(err: ApiError) {
    this.salvando = false;
    // 403 de assinatura (BE-15): o fornecedor precisa de um plano ativo antes de operar.
    if (err?.status === 403) {
      this.precisaAssinatura = true;
      this.erro = err?.message?.trim()
        ? err.message
        : 'É necessário ter uma assinatura ativa para realizar esta operação.';
      return;
    }
    this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o restaurante.';
  }

  irParaAssinatura() {
    this.router.navigate(['/fornecedor/assinatura']);
  }

  irParaCardapio() {
    this.router.navigate(['/fornecedor/cardapio']);
  }

  voltar() {
    history.back();
  }
}
