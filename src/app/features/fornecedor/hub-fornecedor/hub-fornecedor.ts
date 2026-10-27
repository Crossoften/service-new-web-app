import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkService, TrabalhoFornecedor } from '../../../core/services/work';
import { BudgetService, OrcamentoFornecedor } from '../../../core/services/budget';
import { AccommodationService } from '../../../core/services/accommodation';
import { RentalService } from '../../../core/services/rental';
import { TransportService } from '../../../core/services/transport';
import { MarketplaceService } from '../../../core/services/marketplace';
import { ChatUnreadStore } from '../../../core/services/chat-unread-store';

interface VerticalCard {
  icone: string;
  titulo: string;
  descricao: string;
  rota: string;
}

// "Em andamento" = fora de recusados, cancelados e terminais concluídos.
const BOOKING_ATIVO: string[] = ['Requested', 'Confirmed', 'CheckedIn'];
const RENTAL_ATIVO: string[] = ['Requested', 'Accepted', 'Active'];
const TRANSPORT_ATIVO: string[] = ['Requested', 'Quoted', 'Accepted', 'InTransit'];
const COMMERCIAL_ATIVO: string[] = ['Requested', 'Accepted', 'Paid'];
const ORDEM_ATIVIDADES = ['Hospedagem', 'Aluguel', 'Transporte', 'Compra e venda'];

/** Resumo de uma categoria com negociação em andamento recebida pelo fornecedor. */
interface AtividadeHub {
  categoria: string;
  titulo: string;
  subtitulo: string;
  rota: string;
}

/**
 * Hub do fornecedor — landing pós-login para `profileType: Supplier`.
 *
 * O contrato trata `Supplier` como genérico e **multi-vertical**. Além do grid de
 * verticais, o hub agora surfaça a **urgência na entrada** (E2E-2a): trabalhos
 * recém-aprovados pelo cliente (Work `Pending`) e orçamentos a responder — cards
 * separados no topo, cada um levando ao lugar certo. Só front (dados já expostos).
 */
@Component({
  selector: 'app-hub-fornecedor',
  imports: [CommonModule],
  templateUrl: './hub-fornecedor.html',
  styleUrl: './hub-fornecedor.scss',
})
export class HubFornecedorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly works = inject(WorkService);
  private readonly budgets = inject(BudgetService);
  private readonly accommodation = inject(AccommodationService);
  private readonly rental = inject(RentalService);
  private readonly transport = inject(TransportService);
  private readonly marketplace = inject(MarketplaceService);
  protected readonly unread = inject(ChatUnreadStore);

  trabalhosAtivos = 0;
  orcamentosPendentes = 0;

  // Pedidos recebidos em andamento (hospedagem, aluguel, transporte, compra e venda).
  atividades: AtividadeHub[] = [];

  verticais: VerticalCard[] = [
    { icone: '🛵', titulo: 'Delivery', descricao: 'Restaurante, cardápio e pedidos', rota: '/fornecedor/home' },
    { icone: '🔧', titulo: 'Serviços', descricao: 'Serviços, orçamentos e trabalhos', rota: '/fornecedor/servicos' },
    { icone: '🛒', titulo: 'Compra e Venda', descricao: 'Anuncie e gerencie produtos', rota: '/compra-vender/meus-produtos' },
    { icone: '🏠', titulo: 'Hospedagem', descricao: 'Cadastre e gerencie acomodações', rota: '/fornecedor/hospedagem' },
    { icone: '🚚', titulo: 'Transporte', descricao: 'Cadastre e gerencie veículos', rota: '/fornecedor/transporte' },
    { icone: '💼', titulo: 'Empregos', descricao: 'Publique vagas e veja candidaturas', rota: '/empregos/minhas-vagas' },
    { icone: '🏘️', titulo: 'Aluguel', descricao: 'Cadastre e gerencie itens para locação', rota: '/fornecedor/aluguel' },
  ];

  ngOnInit() {
    this.unread.refresh(); // badge de não-lidos no hub (BE-Q5)
    // Trabalho ativo = em jogo até o fim do serviço: recém-aprovado (`Pending`) **ou**
    // já iniciado (`InProgress`). Antes só contava `Pending`, então o card sumia assim
    // que o fornecedor iniciava — agora permanece na home até concluir/cancelar.
    this.works.trabalhos().pipe(catchError(() => of([] as TrabalhoFornecedor[]))).subscribe((lista) => {
      this.trabalhosAtivos = lista.filter(
        (t) => t.statusApi === 'Pending' || t.statusApi === 'InProgress',
      ).length;
    });
    // Orçamentos recebidos aguardando resposta.
    this.budgets
      .recebidos({ status: 'Pending' })
      .pipe(catchError(() => of([] as OrcamentoFornecedor[])))
      .subscribe((lista) => (this.orcamentosPendentes = lista.length));
    this.carregarAtividades();
  }

  /**
   * Pedidos recebidos em andamento nas demais categorias (como `Provider`/`Seller`).
   * Recusados, cancelados e concluídos ficam de fora. As telas de lista são
   * compartilhadas (`participantRole: 'All'`), então levam ao mesmo lugar do cliente.
   */
  private carregarAtividades() {
    this.accommodation.reservas({ participantRole: 'Provider', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Hospedagem', 'Reserva', 'reservas', '/hospedagem/reservas',
          (p.items ?? []).filter((b) => BOOKING_ATIVO.includes(b.status)).map((b) => b.accommodation?.name ?? 'Hospedagem')),
      error: () => {},
    });
    this.rental.alugueis({ participantRole: 'Provider', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Aluguel', 'Aluguel', 'aluguéis', '/aluguel/meus',
          (p.items ?? []).filter((r) => RENTAL_ATIVO.includes(r.status)).map((r) => r.product?.name ?? 'Aluguel')),
      error: () => {},
    });
    this.transport.pedidos({ participantRole: 'Provider', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Transporte', 'Transporte', 'transportes', '/transporte/meus',
          (p.items ?? []).filter((t) => TRANSPORT_ATIVO.includes(t.status)).map((t) => t.transportation?.name ?? 'Transporte')),
      error: () => {},
    });
    this.marketplace.negociacoes({ participantRole: 'Seller', take: 50 }).subscribe({
      next: (p) =>
        this.empilhar('Compra e venda', 'Negociação', 'negociações', '/compra-vender/negociacoes',
          (p.items ?? []).filter((t) => COMMERCIAL_ATIVO.includes(t.status)).map((t) => t.title || 'Negociação')),
      error: () => {},
    });
  }

  /** Adiciona (ou substitui) o card de uma categoria quando há pedidos em andamento. */
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

  abrir(vertical: VerticalCard) {
    this.router.navigate([vertical.rota]);
  }

  irRota(rota: string) {
    this.router.navigate([rota]);
  }

  irPerfil() {
    this.router.navigate(['/fornecedor/perfil']);
  }

  irTrabalhos() {
    this.router.navigate(['/fornecedor/servicos/trabalhos']);
  }

  irOrcamentos() {
    this.router.navigate(['/fornecedor/servicos/orcamentos']);
  }

  irAssinaturas() {
    this.router.navigate(['/fornecedor/assinaturas']);
  }

  irMensagens() {
    this.router.navigate(['/mensagens']);
  }
}
