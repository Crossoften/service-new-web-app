import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { ProfileService } from '../../../core/services/profile';
import { DeliveryService } from '../../../core/services/delivery';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../core/models/food-order';
import { WorkService, Solicitacao } from '../../../core/services/work';
import { BudgetService, Orcamento } from '../../../core/services/budget';
import { BottomNavClienteComponent } from '../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';

/** Status de pedido ainda "em andamento" (não entregue nem cancelado). */
const STATUS_ATIVOS: FoodOrderStatus[] = ['Received', 'Accepted', 'Preparing', 'OnTheWay'];

const STATUS_LABEL: Record<FoodOrderStatus, string> = {
  Received: 'Pedido recebido',
  Accepted: 'Confirmado',
  Preparing: 'Em preparo',
  OnTheWay: 'A caminho',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

@Component({
  selector: 'app-home',
  imports: [CommonModule, BottomNavClienteComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profile = inject(ProfileService);
  private readonly delivery = inject(DeliveryService);
  private readonly works = inject(WorkService);
  private readonly budgets = inject(BudgetService);
  private readonly router = inject(Router);

  devMenuAberto = false;

  // Identidade real do cliente (sem mock)
  nome = '';
  inicial = 'U';

  // Pedidos em andamento (para o destaque na home)
  pedidosAtivos: ResponseFoodOrderDto[] = [];

  // Serviços em andamento (destaque na home — fatia 2). Nº de itens + resumo do topo.
  servicosAtivos = 0;
  servicoResumo?: { titulo: string; subtitulo: string; destaque: boolean };

  servicos = [
    { label: 'DELIVERY',                rota: '/delivery' },
    { label: 'SERVIÇOS',                rota: '/servicos' },
    { label: 'COMPRA E VENDER',         rota: '/compra-vender' },
    { label: 'ALUGUEL',                 rota: '/aluguel' },
    { label: 'TRANSPORTE',              rota: '/transporte' },
    { label: 'HOSPEDAGEM',              rota: '/hospedagem' },
    { label: 'EMPREGOS E EMPREGADORES', rota: '/empregos/vagas' },
    { label: 'ANUNCIE AQUI',            rota: null },
  ];

  ngOnInit() {
    this.profile.me().subscribe({
      next: (p) => {
        this.nome = p.name ?? '';
        this.inicial = (this.nome.trim()[0] ?? 'U').toUpperCase();
      },
      error: () => {},
    });
    this.delivery.getMeusPedidos().subscribe({
      next: (lista) => (this.pedidosAtivos = (lista ?? []).filter((p) => STATUS_ATIVOS.includes(p.status))),
      error: () => {},
    });
    this.carregarServicos();
  }

  /** Serviços em andamento para o card de destaque (solicitações ativas + orçamentos em jogo). */
  private carregarServicos() {
    this.works.minhasSolicitacoes().subscribe({
      next: (lista) => this.montarResumoServicos((lista ?? []).filter((s) => this.solicitacaoAtiva(s)), null),
      error: () => {},
    });
    this.budgets.meus({ scope: 'Requested' }).subscribe({
      next: (lista) => this.montarResumoServicos(null, (lista ?? []).filter((o) => this.orcamentoAtivo(o))),
      error: () => {},
    });
  }

  private solicitacoesAtivas: Solicitacao[] = [];
  private orcamentosAtivos: Orcamento[] = [];

  private montarResumoServicos(solic: Solicitacao[] | null, orc: Orcamento[] | null) {
    if (solic) this.solicitacoesAtivas = solic;
    if (orc) this.orcamentosAtivos = orc;
    this.servicosAtivos = this.solicitacoesAtivas.length + this.orcamentosAtivos.length;

    // Prioriza um item que precisa de ação do cliente (responder orçamento/acréscimo).
    const orcDestaque = this.orcamentosAtivos.find(
      (o) => o.temAcrescimoPendente || o.statusApi === 'Responded' || o.statusApi === 'WaitingInformation',
    );
    const solicDestaque = this.solicitacoesAtivas.find((s) => s.extraPendente);

    if (orcDestaque) {
      this.servicoResumo = {
        titulo: orcDestaque.prestador.profissao || orcDestaque.prestador.nome,
        subtitulo: orcDestaque.temAcrescimoPendente
          ? 'Acréscimo aguardando sua resposta'
          : orcDestaque.statusApi === 'WaitingInformation'
            ? 'O prestador pediu mais informações'
            : 'Orçamento respondido — responda',
        destaque: true,
      };
    } else if (solicDestaque) {
      this.servicoResumo = {
        titulo: solicDestaque.prestador.profissao || solicDestaque.prestador.nome,
        subtitulo: 'Acréscimo aguardando sua resposta',
        destaque: true,
      };
    } else {
      const primeiro = this.solicitacoesAtivas[0] ?? this.orcamentosAtivos[0];
      this.servicoResumo = primeiro
        ? {
            titulo: primeiro.prestador.profissao || primeiro.prestador.nome,
            subtitulo: 'Em andamento',
            destaque: false,
          }
        : undefined;
    }
  }

  private solicitacaoAtiva(s: Solicitacao): boolean {
    return s.status === 'em_andamento' || s.status === 'em_garantia';
  }

  private orcamentoAtivo(o: Orcamento): boolean {
    return o.statusApi === 'Pending' || o.statusApi === 'Responded' || o.statusApi === 'WaitingInformation';
  }

  /** Abre a central de atividade (serviços + delivery). */
  verServicos() {
    this.router.navigate(['/atividade']);
  }

  get nomeExibicao(): string {
    return this.nome.trim() || 'Usuário';
  }

  get pedidoAtivo(): ResponseFoodOrderDto | undefined {
    return this.pedidosAtivos[0];
  }

  statusLabel(status: FoodOrderStatus): string {
    return STATUS_LABEL[status] ?? status;
  }

  /** Abre a listagem dos pedidos do cliente (todos, incluindo os em andamento). */
  verPedidos() {
    this.router.navigate(['/delivery/pedidos']);
  }

  toggleDevMenu() {
    this.devMenuAberto = !this.devMenuAberto;
  }

  navegar(rota: string | null) {
    if (rota) {
      this.devMenuAberto = false;
      this.router.navigate([rota]);
    }
  }

  /** Encerra a sessão e volta ao login (permite trocar de conta/perfil). */
  sair() {
    this.devMenuAberto = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
