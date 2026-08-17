import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Prestador, ServiceCatalogService } from '../../../../core/services/service-catalog';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-listagem-servicos',
  imports: [CommonModule, FormsModule],
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
