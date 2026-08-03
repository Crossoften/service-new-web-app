import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CategoriaCardapioFornecedor,
  FornecedorService,
} from '../../../core/services/fornecedor';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-add-cardapio',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-cardapio.html',
  styleUrl: './add-cardapio.scss',
})
export class AddCardapioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fornecedorService = inject(FornecedorService);

  modoEdicao = false;
  itemId?: number;

  nome = '';
  descricao = '';
  valor = '';
  arquivo = '';
  erro = '';
  salvando = false;

  categorias: CategoriaCardapioFornecedor[] = [];
  categoriaSelecionadaId: number | null = null;
  categoriaAberta = false;
  novaCategoria = '';

  ngOnInit() {
    this.fornecedorService.getCategorias().subscribe({
      next: (cats) => {
        this.categorias = cats;
        if (this.categoriaSelecionadaId == null && cats.length) {
          this.categoriaSelecionadaId = cats[0].id;
        }
      },
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicao = true;
      this.itemId = Number(id);
      this.fornecedorService.getItem(this.itemId).subscribe({
        next: (item) => {
          if (item) {
            this.nome = item.nome;
            this.descricao = item.descricao;
            this.valor = item.valor.toString();
            this.categoriaSelecionadaId = item.categoriaId ?? this.categoriaSelecionadaId;
            this.arquivo = item.imagem;
          }
        },
      });
    }
  }

  get categoriaSelecionadaLabel(): string {
    return this.categorias.find((c) => c.id === this.categoriaSelecionadaId)?.nome ?? 'Selecione';
  }

  toggleCategoria() {
    this.categoriaAberta = !this.categoriaAberta;
  }

  selecionarCategoria(cat: CategoriaCardapioFornecedor) {
    this.categoriaSelecionadaId = cat.id;
    this.categoriaAberta = false;
  }

  selecionarArquivo() {
    // Futuramente: upload via /upload/one-file → imageUrl/imageKey
  }

  salvar() {
    this.erro = '';
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do item.';
      return;
    }
    if (!this.descricao.trim()) {
      this.erro = 'Informe a descrição.';
      return;
    }
    if (!this.valor || isNaN(Number(this.valor))) {
      this.erro = 'Informe um valor válido.';
      return;
    }

    const nova = this.novaCategoria.trim();
    if (!nova && this.categoriaSelecionadaId == null) {
      this.erro = 'Selecione ou crie uma categoria.';
      return;
    }

    this.salvando = true;
    if (nova) {
      this.fornecedorService.criarCategoria({ name: nova }).subscribe({
        next: (cat) => this.persistirItem(cat.id),
        error: (err: ApiError) => this.falhar(err, 'Não foi possível criar a categoria.'),
      });
    } else {
      this.persistirItem(this.categoriaSelecionadaId as number);
    }
  }

  private persistirItem(categoriaId: number) {
    this.fornecedorService
      .salvarItem({
        id: this.itemId,
        nome: this.nome.trim(),
        descricao: this.descricao.trim(),
        valor: Number(this.valor),
        categoriaId,
        imagem: this.arquivo || undefined,
      })
      .subscribe({
        next: () => {
          this.salvando = false;
          this.router.navigate(['/fornecedor/cardapio']);
        },
        error: (err: ApiError) => this.falhar(err, 'Não foi possível salvar o item.'),
      });
  }

  private falhar(err: ApiError, fallback: string) {
    this.salvando = false;
    this.erro = err?.message?.trim() ? err.message : fallback;
  }

  cancelar() {
    history.back();
  }
}
