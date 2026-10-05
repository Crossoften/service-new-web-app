import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkService, Solicitacao } from '../../../core/services/work';
import { BudgetService, Orcamento } from '../../../core/services/budget';
import { DeliveryService } from '../../../core/services/delivery';
import { MarketplaceService } from '../../../core/services/marketplace';
import { RentalService } from '../../../core/services/rental';
import { TransportService } from '../../../core/services/transport';
import { AccommodationService } from '../../../core/services/accommodation';
import { JobService } from '../../../core/services/job';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../core/models/food-order';
import { CommercialTransactionDto } from '../../../core/models/commercial-transaction';
import { RentalDto } from '../../../core/models/rental';
import { TransportRequestDto } from '../../../core/models/transport-request';
import { BookingDto } from '../../../core/models/booking';
import { JobApplicationDto } from '../../../core/models/job-application';
import { Page } from '../../../core/models/pagination';
import { BottomNavClienteComponent } from '../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';
import { ChatUnreadStore } from '../../../core/services/chat-unread-store';

type CategoriaId = 'servicos' | 'delivery' | 'compra-venda' | 'aluguel' | 'transporte' | 'hospedagem' | 'empregos';

/** Uma categoria no índice de Atividade. */
interface CategoriaAtividade {
  id: CategoriaId;
  label: string;
  ativos: number;
  historico: number;
  rota: string[];
}

const STATUS_DELIVERY_ATIVOS: FoodOrderStatus[] = ['Received', 'Accepted', 'Preparing', 'OnTheWay'];
// "Ativo" = em jogo (não terminal), por vertical.
const NEGOCIACAO_ATIVOS = ['Requested', 'Accepted', 'Paid'];
const ALUGUEL_ATIVOS = ['Requested', 'Accepted', 'Active'];
const TRANSPORTE_ATIVOS = ['Requested', 'Quoted', 'Accepted', 'InTransit'];
const RESERVA_ATIVOS = ['Requested', 'Confirmed', 'CheckedIn'];
const CANDIDATURA_ATIVOS = ['Applied', 'Accepted'];

/**
 * **Atividade = índice por categoria** (decisão de IA: super-app category-first).
 * Lista as **categorias em que o cliente tem atividade** (contador de ativos) → cada
 * uma abre a **tela de atividade daquela categoria** (Ativos/Histórico + ações do
 * domínio). Só aparecem categorias com atividade (Q-E2E-1). Cobre as 7 verticais do
 * cliente; verticais cujo back ainda não existe simplesmente retornam vazio (tolerante).
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
  private readonly marketplace = inject(MarketplaceService);
  private readonly rental = inject(RentalService);
  private readonly transport = inject(TransportService);
  private readonly accommodation = inject(AccommodationService);
  private readonly jobs = inject(JobService);
  private readonly router = inject(Router);
  private readonly unread = inject(ChatUnreadStore);

  carregando = false;
  categorias: CategoriaAtividade[] = [];

  ngOnInit() {
    this.unread.refresh(); // badge de não-lidos do menu (BE-Q5)
    this.carregando = true;
    forkJoin({
      solicitacoes: this.arr(this.works.minhasSolicitacoes()),
      orcamentos: this.arr(this.budgets.meus({ scope: 'Requested' })),
      pedidos: this.arr(this.delivery.getMeusPedidos()),
      negociacoes: this.page(this.marketplace.negociacoes({ participantRole: 'All' })),
      alugueis: this.page(this.rental.alugueis({ participantRole: 'All' })),
      transportes: this.page(this.transport.pedidos({ participantRole: 'All' })),
      reservas: this.page(this.accommodation.reservas({ participantRole: 'All' })),
      candidaturas: this.page(this.jobs.minhasCandidaturas()),
    }).subscribe({
      next: (r) => {
        const servicosTotal = (r.orcamentos as Orcamento[]).length + (r.solicitacoes as Solicitacao[]).length;
        const servicos =
          (r.orcamentos as Orcamento[]).filter((o) => this.orcamentoAtivo(o)).length +
          (r.solicitacoes as Solicitacao[]).filter((s) => this.solicitacaoAtiva(s)).length;
        const pedidos = r.pedidos as ResponseFoodOrderDto[];
        const delivery = pedidos.filter((p) => STATUS_DELIVERY_ATIVOS.includes(p.status)).length;
        const negociacoes = r.negociacoes as CommercialTransactionDto[];
        const compraVenda = negociacoes.filter((n) => NEGOCIACAO_ATIVOS.includes(n.status)).length;
        const alugueis = r.alugueis as RentalDto[];
        const aluguel = alugueis.filter((a) => ALUGUEL_ATIVOS.includes(a.status)).length;
        const transportes = r.transportes as TransportRequestDto[];
        const transporte = transportes.filter((t) => TRANSPORTE_ATIVOS.includes(t.status)).length;
        const reservas = r.reservas as BookingDto[];
        const hospedagem = reservas.filter((b) => RESERVA_ATIVOS.includes(b.status)).length;
        const candidaturas = r.candidaturas as JobApplicationDto[];
        const empregos = candidaturas.filter((c) => CANDIDATURA_ATIVOS.includes(c.status)).length;

        // `historico` = itens não-ativos (terminais). Uma categoria entra no índice
        // quando tem ativo **ou** histórico — senão o histórico "sumia" (ex.: delivery
        // só com pedidos entregues não aparecia).
        const todas: CategoriaAtividade[] = [
          { id: 'servicos', label: 'Serviços', ativos: servicos, historico: servicosTotal - servicos, rota: ['/servicos/atividade'] },
          { id: 'delivery', label: 'Delivery', ativos: delivery, historico: pedidos.length - delivery, rota: ['/delivery/pedidos'] },
          { id: 'compra-venda', label: 'Compra e Venda', ativos: compraVenda, historico: negociacoes.length - compraVenda, rota: ['/compra-vender/negociacoes'] },
          { id: 'aluguel', label: 'Aluguel', ativos: aluguel, historico: alugueis.length - aluguel, rota: ['/aluguel/meus'] },
          { id: 'transporte', label: 'Transporte', ativos: transporte, historico: transportes.length - transporte, rota: ['/transporte/meus'] },
          { id: 'hospedagem', label: 'Hospedagem', ativos: hospedagem, historico: reservas.length - hospedagem, rota: ['/hospedagem/reservas'] },
          { id: 'empregos', label: 'Empregos', ativos: empregos, historico: candidaturas.length - empregos, rota: ['/empregos/candidaturas'] },
        ];
        this.categorias = todas.filter((c) => c.ativos + c.historico > 0);
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  abrir(cat: CategoriaAtividade) {
    this.router.navigate(cat.rota);
  }

  /** Subtítulo do card: combina ativos e histórico conforme o que houver. */
  subLabel(cat: CategoriaAtividade): string {
    const partes: string[] = [];
    if (cat.ativos > 0) partes.push(`${cat.ativos} em andamento`);
    if (cat.historico > 0) partes.push(`${cat.historico} no histórico`);
    return partes.join(' · ') || 'Sem atividade';
  }

  /** Normaliza um Observable de lista para array, tolerante a erro. */
  private arr<T>(src: Observable<T[]>): Observable<T[]> {
    return src.pipe(catchError(() => of([] as T[])));
  }

  /** Normaliza um Observable paginado para os itens, tolerante a erro. */
  private page<T>(src: Observable<Page<T>>): Observable<T[]> {
    return src.pipe(
      map((p) => p.items ?? []),
      catchError(() => of([] as T[])),
    );
  }

  private solicitacaoAtiva(s: Solicitacao): boolean {
    return s.status === 'em_andamento' || s.status === 'em_garantia';
  }

  private orcamentoAtivo(o: Orcamento): boolean {
    return o.statusApi === 'Pending' || o.statusApi === 'Responded' || o.statusApi === 'WaitingInformation';
  }
}
