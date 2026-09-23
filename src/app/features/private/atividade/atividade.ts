import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkService, Solicitacao } from '../../../core/services/work';
import { BudgetService, Orcamento } from '../../../core/services/budget';
import { DeliveryService } from '../../../core/services/delivery';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../core/models/food-order';
import { BottomNavClienteComponent } from '../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';

type CategoriaId = 'servicos' | 'delivery';

/** Uma categoria no índice de Atividade. */
interface CategoriaAtividade {
  id: CategoriaId;
  label: string;
  ativos: number;
  rota: string[];
}

const STATUS_DELIVERY_ATIVOS: FoodOrderStatus[] = ['Received', 'Accepted', 'Preparing', 'OnTheWay'];

/**
 * **Atividade = índice por categoria** (decisão de IA: super-app category-first).
 * Em vez de um feed único misturando tudo, lista as **categorias em que o cliente
 * tem atividade** (com contador de ativos); cada uma abre a **tela de atividade
 * daquela categoria** (Ativos/Histórico + ações do domínio). Só aparecem categorias
 * com atividade (Q-E2E-1).
 */
@Component({
  selector: 'app-atividade',
  imports: [CommonModule, BottomNavClienteComponent],
  templateUrl: './atividade.html',
  styleUrl: './atividade.scss',
})
export class AtividadeComponent implements OnInit {
  private readonly works = inject(WorkService);
  private readonly budgets = inject(BudgetService);
  private readonly delivery = inject(DeliveryService);
  private readonly router = inject(Router);

  carregando = false;
  categorias: CategoriaAtividade[] = [];

  ngOnInit() {
    this.carregando = true;
    forkJoin({
      solicitacoes: this.works.minhasSolicitacoes().pipe(catchError(() => of([] as Solicitacao[]))),
      orcamentos: this.budgets
        .meus({ scope: 'Requested' })
        .pipe(catchError(() => of([] as Orcamento[]))),
      pedidos: this.delivery.getMeusPedidos().pipe(catchError(() => of([] as ResponseFoodOrderDto[]))),
    }).subscribe({
      next: ({ solicitacoes, orcamentos, pedidos }) => {
        const servicosAtivos =
          orcamentos.filter((o) => this.orcamentoAtivo(o)).length +
          solicitacoes.filter((s) => this.solicitacaoAtiva(s)).length;
        const deliveryAtivos = pedidos.filter((p) => STATUS_DELIVERY_ATIVOS.includes(p.status)).length;

        const todas: CategoriaAtividade[] = [
          { id: 'servicos', label: 'Serviços', ativos: servicosAtivos, rota: ['/servicos/atividade'] },
          { id: 'delivery', label: 'Delivery', ativos: deliveryAtivos, rota: ['/delivery/pedidos'] },
        ];
        // Q-E2E-1: só mostra categorias com atividade.
        this.categorias = todas.filter((c) => c.ativos > 0);
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  abrir(cat: CategoriaAtividade) {
    this.router.navigate(cat.rota);
  }

  private solicitacaoAtiva(s: Solicitacao): boolean {
    return s.status === 'em_andamento' || s.status === 'em_garantia';
  }

  private orcamentoAtivo(o: Orcamento): boolean {
    return o.statusApi === 'Pending' || o.statusApi === 'Responded' || o.statusApi === 'WaitingInformation';
  }
}
