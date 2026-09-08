import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdicionalFornecedor,
  CategoriaCardapioFornecedor,
  FornecedorService,
} from '../../../core/services/fornecedor';
import { ApiService } from '../../../core/services/api';
import { ApiError } from '../../../core/models/common';
import { formatBRL, maskBRL, parseBRL } from '../../../core/utils/currency';

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
  private readonly api = inject(ApiService);

  modoEdicao = false;
  itemId?: number;

  nome = '';
  descricao = '';
  valor = '';
  arquivo = '';
  erro = '';
  salvando = false;
  enviandoFoto = false;

  categorias: CategoriaCardapioFornecedor[] = [];
  categoriaSelecionadaId: number | null = null;
  categoriaAberta = false;
  novaCategoria = '';

  // Adicionais / complementos (só no modo edição — precisam do id do item)
  adicionais: AdicionalFornecedor[] = [];
  novoAdicionalNome = '';
  novoAdicionalValor = '';
  salvandoAdicional = false;
  removendoId: number | null = null;
  erroAdicional = '';
  aviso = '';

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
            this.valor = formatBRL(Number(item.valor));
            this.categoriaSelecionadaId = item.categoriaId ?? this.categoriaSelecionadaId;
            this.arquivo = item.imagem;
            this.adicionais = item.adicionais ?? [];
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

  /** Máscara de moeda enquanto o usuário digita (trata a entrada como centavos). */
  onValorInput(valor: string) {
    this.valor = maskBRL(valor);
  }

  selecionarArquivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.enviandoFoto = true;
    this.erro = '';
    this.api.uploadOne(file).subscribe({
      next: (res) => {
        this.enviandoFoto = false;
        this.arquivo = res.fileUrl;
      },
      error: (err: ApiError) => {
        this.enviandoFoto = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a imagem.';
      },
    });
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
    const valorNum = parseBRL(this.valor);
    if (!valorNum || valorNum <= 0) {
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
        next: (cat) => this.persistirItem(cat.id, valorNum),
        error: (err: ApiError) => this.falhar(err, 'Não foi possível criar a categoria.'),
      });
    } else {
      this.persistirItem(this.categoriaSelecionadaId as number, valorNum);
    }
  }

  private persistirItem(categoriaId: number, valor: number) {
    const editando = this.itemId != null;
    this.fornecedorService
      .salvarItem({
        id: this.itemId,
        nome: this.nome.trim(),
        descricao: this.descricao.trim(),
        valor,
        categoriaId,
        imagem: this.arquivo || undefined,
      })
      .subscribe({
        next: (item) => {
          this.salvando = false;
          if (editando) {
            this.router.navigate(['/fornecedor/cardapio']);
          } else if (item?.id) {
            // Item novo criado: entra no modo edição do próprio item para,
            // em seguida, cadastrar os adicionais (a rota precisa do id).
            this.router.navigate(['/fornecedor/cardapio/editar', item.id]);
          } else {
            this.router.navigate(['/fornecedor/cardapio']);
          }
        },
        error: (err: ApiError) => this.falhar(err, 'Não foi possível salvar o item.'),
      });
  }

  // ── Adicionais / complementos ───────────────────────────────────────────────

  /** Máscara de moeda no campo de valor do adicional (entrada em centavos). */
  onAdicionalValorInput(valor: string) {
    this.novoAdicionalValor = maskBRL(valor);
  }

  precoAdicional(valor: number): string {
    return valor > 0 ? formatBRL(valor) : 'Grátis';
  }

  adicionarAdicional() {
    this.erroAdicional = '';
    const nome = this.novoAdicionalNome.trim();
    if (!nome) {
      this.erroAdicional = 'Informe o nome do adicional.';
      return;
    }
    if (this.itemId == null) return; // guardado pela UI (só aparece no modo edição)
    const valor = parseBRL(this.novoAdicionalValor) || 0; // opcional; 0 = grátis
    this.salvandoAdicional = true;
    this.fornecedorService.criarAdicional(this.itemId, { nome, valor }).subscribe({
      next: (a) => {
        this.salvandoAdicional = false;
        this.adicionais = [...this.adicionais, a];
        this.novoAdicionalNome = '';
        this.novoAdicionalValor = '';
      },
      error: (err: ApiError) => {
        this.salvandoAdicional = false;
        this.erroAdicional = err?.message?.trim() ? err.message : 'Não foi possível adicionar o adicional.';
      },
    });
  }

  removerAdicional(a: AdicionalFornecedor) {
    if (this.removendoId != null) return;
    this.erroAdicional = '';
    this.removendoId = a.id;
    this.fornecedorService.removerAdicional(a.id).subscribe({
      next: () => {
        this.removendoId = null;
        this.adicionais = this.adicionais.filter((x) => x.id !== a.id);
      },
      error: (err: ApiError) => {
        this.removendoId = null;
        this.erroAdicional = err?.message?.trim() ? err.message : 'Não foi possível remover o adicional.';
      },
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
