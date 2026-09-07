import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MarketplaceService } from '../../../../core/services/marketplace';
import { ApiService } from '../../../../core/services/api';
import { ProductCategoryDto } from '../../../../core/models/product';
import { ProductTransactionType } from '../../../../core/models/enums';
import { ApiError } from '../../../../core/models/common';
import { formatBRL, maskBRL, parseBRL } from '../../../../core/utils/currency';

@Component({
  selector: 'app-criar-produto',
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-produto.html',
  styleUrl: './criar-produto.scss',
})
export class CriarProdutoComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  editId?: number;
  categorias: ProductCategoryDto[] = [];
  categoriasCarregadas = false;

  categoryId?: number;
  /** Fixo em 'Sale' ao criar; preservado ao editar (ex.: RentAndSale). */
  transactionType: ProductTransactionType = 'Sale';
  nome = '';
  modelo = '';
  ano?: number;
  preco = '';
  descricao = '';
  imageUrl = '';
  imageKey = '';

  carregando = false;
  salvando = false;
  enviandoFoto = false;
  erro = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.editId = id ? Number(id) : undefined;

    this.marketplace.categorias().subscribe({
      next: (cats) => {
        this.categorias = cats;
        this.categoriasCarregadas = true;
      },
      error: () => (this.categoriasCarregadas = true),
    });

    if (this.editId) {
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
            this.preco = formatBRL(Number(p.price));
            this.descricao = p.description ?? '';
            this.imageUrl = p.imageUrl ?? '';
            this.imageKey = p.imageKey ?? '';
          },
          error: (err: ApiError) => {
            this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o produto.';
          },
        });
    }
  }

  get semCategorias(): boolean {
    return this.categoriasCarregadas && this.categorias.length === 0;
  }

  get titulo(): string {
    return this.editId ? 'Editar produto' : 'Novo produto';
  }

  get tipoLabel(): string {
    return this.marketplace.tipoLabel(this.transactionType);
  }

  selecionarFoto(event: Event) {
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

  onPrecoInput(valor: string) {
    this.preco = maskBRL(valor);
  }

  salvar() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.categoryId) {
      this.erro = 'Selecione uma categoria.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do produto.';
      return;
    }
    const precoNum = parseBRL(this.preco);
    if (!precoNum || precoNum <= 0) {
      this.erro = 'Informe um preço válido.';
      return;
    }

    const dto = {
      categoryId: this.categoryId,
      transactionType: this.transactionType,
      name: this.nome.trim(),
      model: this.modelo.trim() || undefined,
      year: this.ano || undefined,
      price: precoNum,
      description: this.descricao.trim() || undefined,
      imageUrl: this.imageUrl || undefined,
      imageKey: this.imageKey || undefined,
    };

    this.salvando = true;
    const req$ = this.editId
      ? this.marketplace.atualizar(this.editId, dto)
      : this.marketplace.criar(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => this.router.navigate(['/compra-vender/meus-produtos']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o produto.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
