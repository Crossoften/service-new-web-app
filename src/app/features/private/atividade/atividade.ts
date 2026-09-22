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

type CategoriaAtividade = 'servicos' | 'delivery';
type FiltroAtividade = 'todos' | CategoriaAtividade;

/** Item unificado exibido na central de Atividade (qualquer vertical). */
interface AtividadeItem {
  categoria: CategoriaAtividade;
  categoriaLabel: string;
  titulo: string;
  subtitulo: string;
  /** Precisa de ação do cliente (responder orçamento/acréscimo). */
  destaque: boolean;
  rota: (string | number)[];
}

const STATUS_DELIVERY_ATIVOS: FoodOrderStatus[] = ['Received', 'Accepted', 'Preparing', 'OnTheWay'];
const STATUS_DELIVERY_LABEL: Record<FoodOrderStatus, string> = {
  Received: 'Pedido recebido',
  Accepted: 'Confirmado',
  Preparing: 'Em preparo',
  OnTheWay: 'A caminho',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

/**
 * Central de **Atividade** do cliente — agrega os itens em andamento de todas as
 * verticais num só lugar (decisão UX-B). MVP: Serviços (orçamentos + solicitações,
 * sem o jargão orçamento/trabalho) e Delivery (pedidos). Filtros por categoria.
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

  itens: AtividadeItem[] = [];
  filtro: FiltroAtividade = 'todos';
  carregando = false;

  filtros: { id: FiltroAtividade; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'delivery', label: 'Delivery' },
  ];

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
        this.itens = [
          ...orcamentos.filter((o) => this.orcamentoAtivo(o)).map((o) => this.deOrcamento(o)),
          ...solicitacoes.filter((s) => this.solicitacaoAtiva(s)).map((s) => this.deSolicitacao(s)),
          ...pedidos
            .filter((p) => STATUS_DELIVERY_ATIVOS.includes(p.status))
            .map((p) => this.dePedido(p)),
        ].sort((a, b) => Number(b.destaque) - Number(a.destaque));
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  get itensFiltrados(): AtividadeItem[] {
    if (this.filtro === 'todos') return this.itens;
    return this.itens.filter((i) => i.categoria === this.filtro);
  }

  selecionarFiltro(f: FiltroAtividade) {
    this.filtro = f;
  }

  abrir(item: AtividadeItem) {
    this.router.navigate(item.rota);
  }

  // ── Regras de "está ativo" ─────────────────────────────────────────────────

  /** Orçamento aparece enquanto está em jogo (aguardando ou respondido); some ao virar trabalho/recusado. */
  private orcamentoAtivo(o: Orcamento): boolean {
    return (
      o.statusApi === 'Pending' ||
      o.statusApi === 'Responded' ||
      o.statusApi === 'WaitingInformation'
    );
  }

  private solicitacaoAtiva(s: Solicitacao): boolean {
    return s.status === 'em_andamento' || s.status === 'em_garantia';
  }

  // ── Mapeamento → item unificado ────────────────────────────────────────────

  private deOrcamento(o: Orcamento): AtividadeItem {
    let subtitulo = 'Aguardando resposta do prestador';
    let destaque = false;
    if (o.temAcrescimoPendente) {
      subtitulo = 'Acréscimo aguardando sua resposta';
      destaque = true;
    } else if (o.statusApi === 'Responded') {
      subtitulo = 'Orçamento respondido — responda';
      destaque = true;
    } else if (o.statusApi === 'WaitingInformation') {
      subtitulo = 'O prestador pediu mais informações';
      destaque = true;
    }
    return {
      categoria: 'servicos',
      categoriaLabel: 'Serviços',
      titulo: o.prestador.profissao || o.prestador.nome,
      subtitulo,
      destaque,
      rota: ['/servicos/orcamento', o.id],
    };
  }

  private deSolicitacao(s: Solicitacao): AtividadeItem {
    let subtitulo = 'Serviço em andamento';
    let destaque = false;
    if (s.extraPendente) {
      subtitulo = 'Acréscimo aguardando sua resposta';
      destaque = true;
    } else if (s.status === 'em_garantia') {
      subtitulo = 'Em garantia';
    }
    return {
      categoria: 'servicos',
      categoriaLabel: 'Serviços',
      titulo: s.prestador.profissao || s.prestador.nome,
      subtitulo,
      destaque,
      rota: ['/servicos/solicitacao', s.id],
    };
  }

  private dePedido(p: ResponseFoodOrderDto): AtividadeItem {
    return {
      categoria: 'delivery',
      categoriaLabel: 'Delivery',
      titulo: p.restaurant?.name ?? 'Pedido',
      subtitulo: STATUS_DELIVERY_LABEL[p.status] ?? 'Em andamento',
      destaque: false,
      rota: ['/delivery/status', p.id],
    };
  }
}
