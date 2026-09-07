import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../../core/services/marketplace';
import { ApiService } from '../../../../core/services/api';
import { CreateProductDto, ProductCategoryDto } from '../../../../core/models/product';
import { ProductTransactionType } from '../../../../core/models/enums';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-criar-aluguel-fornecedor',
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-aluguel-fornecedor.html',
  styleUrl: './criar-aluguel-fornecedor.scss',
})
export class CriarAluguelFornecedorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly marketplace = inject(MarketplaceService);
  private readonly api = inject(ApiService);

  editId?: number;
  categorias: ProductCategoryDto[] = [];

  categoryId?: number;
  /** Fixo em 'Rent' ao criar; preservado ao editar (ex.: RentAndSale). */
  transactionType: ProductTransactionType = 'Rent';
  nome = '';
  modelo = '';
  ano?: number;
  preco?: number;
  descricao = '';
  imageUrl = '';
  imageKey = '';
  ativo = true;

  carregando = false;
  salvando = false;
  enviandoFoto = false;
  erro = '';

  ngOnInit() {
    this.marketplace.categorias().subscribe({
      next: (cats) => (this.categorias = cats),
      error: () => {},
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.editId = Number(id);
      this.carregando = true;
      this.marketplace
        .produto(this.editId)
        .pipe(finalize(() => (this.carregando = false)))
        .subscribe({
          next: (p) => {
            this.categoryId = p.categoryId;
            this.transactionType = p.transactionType;
            this.nome = p.name;
            this.modelo = p.model ?? '';
            this.ano = p.year;
            this.preco = Number(p.price);
            this.descricao = p.description ?? '';
            this.imageUrl = p.imageUrl ?? '';
            this.imageKey = p.imageKey ?? '';
            this.ativo = p.isActive;
          },
          error: (err: ApiError) => {
            this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o item.';
          },
        });
    }
  }

  get titulo(): string {
    return this.editId ? 'Editar item de aluguel' : 'Novo item de aluguel';
  }

  get tipoLabel(): string {
    return this.marketplace.tipoLabel(this.transactionType);
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
      this.erro = 'Informe o nome do item.';
      return;
    }
    if (this.preco === undefined || this.preco === null || isNaN(Number(this.preco)) || Number(this.preco) < 0) {
      this.erro = 'Informe um valor válido.';
      return;
    }

    const dto: CreateProductDto = {
      categoryId: this.categoryId,
      transactionType: this.transactionType,
      name: this.nome.trim(),
      model: this.modelo.trim() || undefined,
      year: this.ano ?? undefined,
      price: Number(this.preco),
      description: this.descricao.trim() || undefined,
      imageUrl: this.imageUrl || undefined,
      imageKey: this.imageKey || undefined,
      isActive: this.ativo,
    };

    this.salvando = true;
    const req$ = this.editId
      ? this.marketplace.atualizar(this.editId, dto)
      : this.marketplace.criar(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => this.router.navigate(['/fornecedor/aluguel']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o item.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
