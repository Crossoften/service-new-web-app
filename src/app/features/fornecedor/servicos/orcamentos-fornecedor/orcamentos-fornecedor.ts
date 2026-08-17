import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BudgetService, OrcamentoFornecedor } from '../../../../core/services/budget';
import { BottomNavFornecedorServicosComponent } from '../../../../shared/components/bottom-nav-fornecedor-servicos/bottom-nav-fornecedor-servicos';
import { ApiError } from '../../../../core/models/common';

type TabOrcamento = 'todos' | 'respondidos' | 'nao_respondidos';

@Component({
  selector: 'app-orcamentos-fornecedor',
  imports: [CommonModule, FormsModule, BottomNavFornecedorServicosComponent],
  templateUrl: './orcamentos-fornecedor.html',
  styleUrl: './orcamentos-fornecedor.scss',
})
export class OrcamentosFornecedorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly budgets = inject(BudgetService);

  orcamentos: OrcamentoFornecedor[] = [];
  tabAtiva: TabOrcamento = 'todos';
  busca = '';
  filtroAberto = false;
  carregando = false;
  erro = '';

  tabs: { id: TabOrcamento; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'respondidos', label: 'Respondidos' },
    { id: 'nao_respondidos', label: 'Não Respondidos' },
  ];

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    const status =
      this.tabAtiva === 'respondidos'
        ? 'Responded'
        : this.tabAtiva === 'nao_respondidos'
          ? 'Pending'
          : undefined;
    this.budgets
      .recebidos({ status })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => (this.orcamentos = lista),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os orçamentos.';
        },
      });
  }

  trocarTab(tab: TabOrcamento) {
    this.tabAtiva = tab;
    this.carregar();
  }

  get orcamentosFiltrados(): OrcamentoFornecedor[] {
    if (!this.busca.trim()) return this.orcamentos;
    return this.orcamentos.filter((o) => o.cliente.toLowerCase().includes(this.busca.toLowerCase()));
  }

  toggleFiltro() {
    this.filtroAberto = !this.filtroAberto;
  }

  abrirOrcamento(orcamento: OrcamentoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/orcamento', orcamento.id]);
  }
}
