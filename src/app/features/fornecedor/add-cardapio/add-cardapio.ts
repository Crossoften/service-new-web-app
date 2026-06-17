import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorService, ItemCardapioFornecedor } from '../../../core/services/fornecedor';

@Component({
  selector: 'app-add-cardapio',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-cardapio.html',
  styleUrl: './add-cardapio.scss'
})
export class AddCardapioComponent implements OnInit {
  modoEdicao: boolean = false;
  itemId?: number;

  nome: string = '';
  descricao: string = '';
  valor: string = '';
  categoriaSelecionada: string = '';
  categoriaAberta: boolean = false;
  arquivo: string = '';
  erro: string = '';

  categorias: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fornecedorService: FornecedorService
  ) {}

  ngOnInit() {
    this.categorias = this.fornecedorService.getCategorias();
    this.categoriaSelecionada = this.categorias[0];

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicao = true;
      this.itemId = Number(id);
      const item = this.fornecedorService.getItem(this.itemId);
      if (item) {
        this.nome = item.nome;
        this.descricao = item.descricao;
        this.valor = item.valor.toString();
        this.categoriaSelecionada = item.categoria;
        this.arquivo = item.imagem;
      }
    }
  }

  toggleCategoria() {
    this.categoriaAberta = !this.categoriaAberta;
  }

  selecionarCategoria(categoria: string) {
    this.categoriaSelecionada = categoria;
    this.categoriaAberta = false;
  }

  selecionarArquivo() {
    // Futuramente: abrir file picker
  }

  salvar() {
    this.erro = '';

    if (!this.nome.trim()) { this.erro = 'Informe o nome do item.'; return; }
    if (!this.descricao.trim()) { this.erro = 'Informe a descrição.'; return; }
    if (!this.valor || isNaN(Number(this.valor))) { this.erro = 'Informe um valor válido.'; return; }

    this.fornecedorService.salvarItem({
      id: this.itemId,
      nome: this.nome,
      descricao: this.descricao,
      valor: Number(this.valor),
      categoria: this.categoriaSelecionada,
      imagem: this.arquivo,
    });

    this.router.navigate(['/fornecedor/cardapio']);
  }

  cancelar() {
    history.back();
  }
}