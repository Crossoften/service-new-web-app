import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Prestador, ServiceCatalogService } from '../../../../core/services/service-catalog';
import { ApiError } from '../../../../core/models/common';
import { OrdenacaoItensComponent } from '../../../../shared/components/ordenacao-itens/ordenacao-itens';
import { OrdenacaoItem } from '../../../../core/utils/item-search';

@Component({
  selector: 'app-listagem-servicos',
  imports: [CommonModule, FormsModule, OrdenacaoItensComponent],
  templateUrl: './listagem-servicos.html',
  styleUrl: './listagem-servicos.scss',
})
export class ListagemServicosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(ServiceCatalogService);

  categoria = '';
  categoryId?: number;
  prestadores: Prestador[] = [];
  busca = '';
  ordenacao: OrdenacaoItem = 'relevancia';
  selecionarTodos = false;
  carregando = false;
  erro = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('categoria');
    this.categoryId = id ? Number(id) : undefined;
    this.categoria = this.route.snapshot.queryParamMap.get('nome') ?? '';
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.catalog
      .prestadores({ categoryId: this.categoryId, search: this.busca.trim() || undefined })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => (this.prestadores = lista),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os prestadores.';
        },
      });
  }

  get prestadoresFiltrados(): Prestador[] {
    if (!this.busca.trim()) return this.prestadores;
    const t = this.busca.toLowerCase();
    return this.prestadores.filter(
      (p) => p.nome.toLowerCase().includes(t) || p.profissao.toLowerCase().includes(t),
    );
  }

  /** Filtro por texto + ordenação. `avaliacao` = (gostei − não gostei); preço opcional vai ao fim. */
  get prestadoresOrdenados(): Prestador[] {
    const base = this.prestadoresFiltrados;
    switch (this.ordenacao) {
      case 'preco-asc':
        return [...base].sort((a, b) => (a.preco ?? Infinity) - (b.preco ?? Infinity));
      case 'preco-desc':
        return [...base].sort((a, b) => (b.preco ?? -Infinity) - (a.preco ?? -Infinity));
      case 'avaliacao':
        return [...base].sort((a, b) => b.gostei - b.naoGostei - (a.gostei - a.naoGostei));
      default:
        return base;
    }
  }

  toggleTodos() {
    this.selecionarTodos = !this.selecionarTodos;
    this.prestadores.forEach((p) => (p.selecionado = this.selecionarTodos));
  }

  togglePrestador(prestador: Prestador) {
    prestador.selecionado = !prestador.selecionado;
    this.selecionarTodos = this.prestadores.every((p) => p.selecionado);
  }

  abrirDetalhes(prestador: Prestador, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/servicos/prestador', prestador.id]);
  }

  get algumSelecionado(): boolean {
    return this.prestadores.some((p) => p.selecionado);
  }

  confirmar() {
    const ids = this.prestadores.filter((p) => p.selecionado).map((p) => p.id);
    if (!ids.length) return;
    this.router.navigate(['/servicos/requisitos'], { queryParams: { ids: ids.join(',') } });
  }

  voltar() {
    history.back();
  }
}
