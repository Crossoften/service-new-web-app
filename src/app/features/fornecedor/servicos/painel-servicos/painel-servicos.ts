import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BudgetService, OrcamentoFornecedor } from '../../../../core/services/budget';
import { WorkService, TrabalhoFornecedor } from '../../../../core/services/work';
import { BottomNavFornecedorServicosComponent } from '../../../../shared/components/bottom-nav-fornecedor-servicos/bottom-nav-fornecedor-servicos';

/**
 * Painel de Serviços do fornecedor (landing). Em vez de cair no catálogo, mostra
 * o que precisa de ação: **orçamentos a responder** e **trabalhos ativos**, com
 * contadores. O catálogo ("Meus serviços") vira destino secundário. (Decisão UX-C.)
 */
@Component({
  selector: 'app-painel-servicos',
  imports: [CommonModule, BottomNavFornecedorServicosComponent],
  templateUrl: './painel-servicos.html',
  styleUrl: './painel-servicos.scss',
})
export class PainelServicosComponent implements OnInit {
  private readonly budgets = inject(BudgetService);
  private readonly works = inject(WorkService);
  private readonly router = inject(Router);

  carregando = false;
  orcamentosPendentes: OrcamentoFornecedor[] = [];
  trabalhosAtivos: TrabalhoFornecedor[] = [];

  ngOnInit() {
    this.carregando = true;
    forkJoin({
      orcamentos: this.budgets
        .recebidos({ status: 'Pending' })
        .pipe(catchError(() => of([] as OrcamentoFornecedor[]))),
      trabalhos: this.works.trabalhos().pipe(catchError(() => of([] as TrabalhoFornecedor[]))),
    }).subscribe({
      next: ({ orcamentos, trabalhos }) => {
        this.orcamentosPendentes = orcamentos;
        this.trabalhosAtivos = trabalhos.filter(
          (t) => t.status === 'em_andamento' || t.status === 'em_garantia',
        );
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  irOrcamentos() {
    this.router.navigate(['/fornecedor/servicos/orcamentos']);
  }

  irTrabalhos() {
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  abrirOrcamento(o: OrcamentoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/orcamento', o.id]);
  }

  abrirTrabalho(t: TrabalhoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/trabalho', t.id]);
  }

  irMeusServicos() {
    this.router.navigate(['/fornecedor/servicos/meus']);
  }
}
