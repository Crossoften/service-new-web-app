import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile';
import { DeliveryService } from '../../../core/services/delivery';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../core/models/food-order';
import { WorkService, Solicitacao } from '../../../core/services/work';
import { BudgetService, Orcamento } from '../../../core/services/budget';
import { AccommodationService } from '../../../core/services/accommodation';
import { RentalService } from '../../../core/services/rental';
import { TransportService } from '../../../core/services/transport';
import { MarketplaceService } from '../../../core/services/marketplace';
import { BottomNavClienteComponent } from '../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';
import { ChatUnreadStore } from '../../../core/services/chat-unread-store';

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

// "Em andamento" = fora de recusados, cancelados e terminais concluídos.
const BOOKING_ATIVO: string[] = ['Requested', 'Confirmed', 'CheckedIn'];
const RENTAL_ATIVO: string[] = ['Requested', 'Accepted', 'Active'];
const TRANSPORT_ATIVO: string[] = ['Requested', 'Quoted', 'Accepted', 'InTransit'];
const COMMERCIAL_ATIVO: string[] = ['Requested', 'Accepted', 'Paid'];
const ORDEM_ATIVIDADES = ['Hospedagem', 'Aluguel', 'Transporte', 'Compra e venda'];

/** Resumo de uma categoria com negociação em andamento, para o destaque na home. */
interface AtividadeHome {
  categoria: string;
  titulo: string;
  subtitulo: string;
  rota: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, BottomNavClienteComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly profile = inject(ProfileService);
  private readonly delivery = inject(DeliveryService);
  private readonly works = inject(WorkService);
  private readonly budgets = inject(BudgetService);
  private readonly accommodation = inject(AccommodationService);
  private readonly rental = inject(RentalService);
  private readonly transport = inject(TransportService);
  private readonly marketplace = inject(MarketplaceService);
  private readonly unread = inject(ChatUnreadStore);
  private readonly router = inject(Router);

  // Identidade real do cliente (sem mock)
  nome = '';
  inicial = 'U';
  fotoUrl?: string;

  // Pedidos em andamento (para o destaque na home)
  pedidosAtivos: ResponseFoodOrderDto[] = [];

  // Serviços em andamento (destaque na home — fatia 2). Nº de itens + resumo do topo.
  servicosAtivos = 0;
  servicoResumo?: { titulo: string; subtitulo: string; destaque: boolean };

  // Outras categorias com negociação em andamento (hospedagem, aluguel, transporte, compra e venda).
  atividades: AtividadeHome[] = [];

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
    this.unread.refresh(); // badge de não-lidos do menu (BE-Q5)
    this.profile.me().subscribe({
      next: (p) => {
        this.nome = p.name ?? '';
        this.inicial = (this.nome.trim()[0] ?? 'U').toUpperCase();
        this.fotoUrl = p.fileUrl;
      },
      error: () => {},
    });
    this.delivery.getMeusPedidos().subscribe({
      next: (lista) => (this.pedidosAtivos = (lista ?? []).filter((p) => STATUS_ATIVOS.includes(p.status))),
      error: () => {},
    });
    this.carregarServicos();
    this.carregarAtividades();
  }

  /**
   * Itens em andamento das demais categorias (hospedagem, aluguel, transporte,
   * compra e venda). Cada categoria vira um card se tiver algo ativo; recusados,
   * cancelados e concluídos ficam de fora.
   */
  private carregarAtividades() {
    this.accommodation.reservas({ participantRole: 'Requester', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Hospedagem', 'Reserva', 'reservas', '/hospedagem/reservas',
          (p.items ?? []).filter((b) => BOOKING_ATIVO.includes(b.status)).map((b) => b.accommodation?.name ?? 'Hospedagem')),
      error: () => {},
    });
    this.rental.alugueis({ participantRole: 'Requester', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Aluguel', 'Aluguel', 'aluguéis', '/aluguel/meus',
          (p.items ?? []).filter((r) => RENTAL_ATIVO.includes(r.status)).map((r) => r.product?.name ?? 'Aluguel')),
      error: () => {},
    });
    this.transport.pedidos({ participantRole: 'Requester', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Transporte', 'Transporte', 'transportes', '/transporte/meus',
          (p.items ?? []).filter((t) => TRANSPORT_ATIVO.includes(t.status)).map((t) => t.transportation?.name ?? 'Transporte')),
      error: () => {},
    });
    this.marketplace.negociacoes({ participantRole: 'Buyer', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Compra e venda', 'Negociação', 'negociações', '/compra-vender/negociacoes',
          (p.items ?? []).filter((t) => COMMERCIAL_ATIVO.includes(t.status)).map((t) => t.title || 'Negociação')),
      error: () => {},
    });
  }

  /** Adiciona (ou substitui) o card de uma categoria quando há itens em andamento. */
  private empilhar(categoria: string, singular: string, plural: string, rota: string, nomes: string[]) {
    const outras = this.atividades.filter((a) => a.categoria !== categoria);
    if (!nomes.length) {
      this.atividades = outras;
      return;
    }
    const n = nomes.length;
    this.atividades = [
      ...outras,
      {
        categoria,
        titulo: n > 1 ? `${n} ${plural} em andamento` : `${singular} em andamento`,
        subtitulo: nomes[0],
        rota,
      },
    ].sort((a, b) => ORDEM_ATIVIDADES.indexOf(a.categoria) - ORDEM_ATIVIDADES.indexOf(b.categoria));
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
    return s.status === 'em_andamento' || s.status === 'garantia_solicitada' || s.status === 'em_garantia';
  }

  private orcamentoAtivo(o: Orcamento): boolean {
    return o.statusApi === 'Pending' || o.statusApi === 'Responded' || o.statusApi === 'WaitingInformation';
  }

  /** Abre a atividade de Serviços (orçamentos + trabalhos). */
  verServicos() {
    this.router.navigate(['/servicos/atividade']);
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

  navegar(rota: string | null) {
    if (rota) {
      this.router.navigate([rota]);
    }
  }
}
