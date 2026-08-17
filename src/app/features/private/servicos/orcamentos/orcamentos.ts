import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BudgetService, Orcamento, StatusOrcamento } from '../../../../core/services/budget';
import { ApiError } from '../../../../core/models/common';

type TabOrcamento = 'todos' | 'respondidos' | 'nao_respondidos';

@Component({
  selector: 'app-orcamentos',
  imports: [CommonModule, FormsModule],
  templateUrl: './orcamentos.html',
  styleUrl: './orcamentos.scss',
})
export class OrcamentosComponent implements OnInit {
  readonly router = inject(Router);
  private readonly budgets = inject(BudgetService);

  orcamentos: Orcamento[] = [];
  tabAtiva: TabOrcamento = 'todos';
  busca = '';
  carregando = false;
  erro = '';

  tabs: { id: TabOrcamento; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'respondidos', label: 'Respondidos' },
    { id: 'nao_respondidos', label: 'Não Respondidos' },
  ];

  ngOnInit() {
    this.carregando = true;
    // scope=Requested → orçamentos que EU (cliente) solicitei.
    this.budgets
      .meus({ scope: 'Requested' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => (this.orcamentos = lista),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os orçamentos.';
        },
      });
  }

  get orcamentosFiltrados(): Orcamento[] {
    let lista = this.orcamentos;
    if (this.tabAtiva === 'respondidos') {
      lista = lista.filter((o) => o.status === 'finalizado' || o.status === 'em_andamento');
    } else if (this.tabAtiva === 'nao_respondidos') {
      lista = lista.filter((o) => o.status === 'nao_respondido');
    }
    if (this.busca.trim()) {
      lista = lista.filter((o) => o.prestador.nome.toLowerCase().includes(this.busca.toLowerCase()));
    }
    return lista;
  }

  statusLabel(status: StatusOrcamento): string {
    const labels: Record<StatusOrcamento, string> = {
      nao_respondido: 'Não respondido',
      finalizado: 'Finalizado',
      em_andamento: 'Em andamento',
    };
    return labels[status];
  }

  statusClass(status: StatusOrcamento): string {
    const classes: Record<StatusOrcamento, string> = {
      nao_respondido: 'status--amarelo',
      finalizado: 'status--verde',
      em_andamento: 'status--laranja',
    };
    return classes[status];
  }

  abrirOrcamento(orcamento: Orcamento) {
    this.router.navigate(['/servicos/orcamento', orcamento.id]);
  }

  voltar() {
    history.back();
  }
}
