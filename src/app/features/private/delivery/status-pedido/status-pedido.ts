import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { DeliveryService } from '../../../../core/services/delivery';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../../core/models/food-order';
import { ApiError } from '../../../../core/models/common';
import { MapaRastreioComponent } from '../../../../shared/components/mapa-rastreio/mapa-rastreio';

interface EtapaStatus {
  id: string;
  label: string;
}

const POLL_MS = 8000;

/** Índice da etapa (0..3) por status da API. `Cancelled` é tratado à parte. */
const STATUS_INDEX: Record<FoodOrderStatus, number> = {
  Received: 0,
  Accepted: 0,
  Preparing: 1,
  OnTheWay: 2,
  Delivered: 3,
  Cancelled: 0,
};

@Component({
  selector: 'app-status-pedido',
  imports: [CommonModule, MapaRastreioComponent],
  templateUrl: './status-pedido.html',
  styleUrl: './status-pedido.scss',
})
export class StatusPedidoComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  private readonly destroy$ = new Subject<void>();
  private pollSub?: Subscription;

  pedidoId = 0;
  pedido?: ResponseFoodOrderDto;
  carregando = true;
  erro = '';
  cancelando = false;
  pagando = false;

  etapas: EtapaStatus[] = [
    { id: 'recebido', label: 'Pedido recebido' },
    { id: 'preparo', label: 'Em preparo' },
    { id: 'caminho', label: 'A caminho' },
    { id: 'entregue', label: 'Entregue' },
  ];

  ngOnInit() {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.iniciarPolling();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private iniciarPolling() {
    this.pollSub = timer(0, POLL_MS)
      .pipe(
        switchMap(() => this.deliveryService.getPedido(this.pedidoId)),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (p) => {
          this.carregando = false;
          this.pedido = p;
          if (this.finalizado) {
            this.pollSub?.unsubscribe();
          }
        },
        error: (err: ApiError) => {
          this.carregando = false;
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o pedido.';
        },
      });
  }

  get status(): FoodOrderStatus | undefined {
    return this.pedido?.status;
  }

  get cancelado(): boolean {
    return this.status === 'Cancelled';
  }

  get finalizado(): boolean {
    return this.status === 'Delivered' || this.status === 'Cancelled';
  }

  get indexAtual(): number {
    return this.status ? STATUS_INDEX[this.status] : 0;
  }

  get labelAtual(): string {
    if (this.cancelado) return 'Pedido cancelado';
    return this.etapas[this.indexAtual]?.label ?? '';
  }

  etapaAtingida(index: number): boolean {
    return !this.cancelado && index <= this.indexAtual;
  }

  get podeCancelar(): boolean {
    return this.status === 'Received' || this.status === 'Accepted' || this.status === 'Preparing';
  }

  get rastreando(): boolean {
    return this.status === 'OnTheWay' && !!this.pedido?.delivery?.currentLat;
  }

  /** A caminho: liga o rastreio ao vivo no mapa (mesmo antes da 1ª posição). */
  get emRota(): boolean {
    return this.status === 'OnTheWay';
  }

  get deliveryId(): number | undefined {
    return this.pedido?.delivery?.id;
  }

  get latEntrega(): string | undefined {
    return this.pedido?.delivery?.currentLat;
  }

  get lngEntrega(): string | undefined {
    return this.pedido?.delivery?.currentLng;
  }

  /** Pagamento online só faz sentido para pedido não-dinheiro ainda pendente e não cancelado. */
  get podePagar(): boolean {
    return (
      !!this.pedido &&
      this.pedido.paymentMethod !== 'Cash' &&
      this.pedido.paymentStatus === 'Pending' &&
      !this.cancelado
    );
  }

  get pagamentoLabel(): string {
    switch (this.pedido?.paymentStatus) {
      case 'Paid':
        return 'Pago';
      case 'Cancelled':
        return 'Pagamento cancelado';
      case 'Pending':
        return this.pedido?.paymentMethod === 'Cash' ? 'Na entrega' : 'Aguardando pagamento';
      default:
        return '';
    }
  }

  pagar() {
    if (this.pagando || !this.podePagar) return;
    this.pagando = true;
    this.erro = '';
    this.deliveryService.pagarPedido(this.pedidoId).subscribe({
      next: (res) => {
        // Leva o cliente ao checkout do Mercado Pago. A confirmação chega por webhook;
        // ao voltar, o polling reconsulta o pedido e o paymentStatus vira `Paid`.
        window.location.href = res.checkoutUrl;
      },
      error: (err: ApiError) => {
        this.pagando = false;
        // Travas do back (checkout em aberto, já pago, cancelado, restaurante sem MP):
        // mostra a mensagem da API e reconsulta para atualizar o estado da tela.
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível iniciar o pagamento.';
        this.deliveryService.getPedido(this.pedidoId).subscribe({
          next: (p) => (this.pedido = p),
          error: () => {},
        });
      },
    });
  }

  cancelar() {
    if (this.cancelando || !this.podeCancelar) return;
    this.cancelando = true;
    this.erro = '';
    this.deliveryService.cancelarPedido(this.pedidoId, 'Cancelado pelo cliente').subscribe({
      next: (p) => {
        this.cancelando = false;
        this.pedido = p;
        this.pollSub?.unsubscribe();
      },
      error: (err: ApiError) => {
        this.cancelando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível cancelar o pedido.';
      },
    });
  }

  fmt(valor?: string): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  ajuda() {
    // implementar depois
  }

  abrirChat() {
    if (this.pedido) this.router.navigate(['/chat', this.pedido.chatRoomId]);
  }

  voltar() {
    this.router.navigate(['/home']);
  }
}
