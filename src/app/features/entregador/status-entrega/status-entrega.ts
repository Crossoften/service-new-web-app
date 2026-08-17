import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { EntregadorService } from '../../../core/services/entregador';
import { DeliveryStatus, ResponseDeliveryDto } from '../../../core/models/delivery';
import { ApiError } from '../../../core/models/common';

interface EtapaEntrega {
  id: DeliveryStatus;
  label: string;
}

const GPS_INTERVAL_MS = 15000;

/** Índice da etapa (0..3) por status da API. */
const STATUS_INDEX: Record<DeliveryStatus, number> = {
  Pending: 0,
  Accepted: 0,
  Rejected: 0,
  PickedUp: 1,
  OnTheWay: 2,
  Delivered: 3,
  Cancelled: 0,
};

@Component({
  selector: 'app-status-entrega',
  imports: [CommonModule],
  templateUrl: './status-entrega.html',
  styleUrl: './status-entrega.scss',
})
export class StatusEntregaComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly entregadorService = inject(EntregadorService);

  entregaId = 0;
  entrega?: ResponseDeliveryDto;
  carregando = false;
  processando = false;
  erro = '';
  gpsAtivo = false;
  private gpsTimer?: ReturnType<typeof setInterval>;

  etapas: EtapaEntrega[] = [
    { id: 'Accepted', label: 'Aceito' },
    { id: 'PickedUp', label: 'Coletado' },
    { id: 'OnTheWay', label: 'A caminho' },
    { id: 'Delivered', label: 'Entregue' },
  ];

  ngOnInit() {
    this.entregaId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  ngOnDestroy() {
    this.pararGps();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.entregadorService
      .getEntrega(this.entregaId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (e) => this.aplicar(e),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a entrega.';
        },
      });
  }

  private aplicar(e: ResponseDeliveryDto) {
    this.entrega = e;
    // GPS ativo enquanto a corrida está em andamento (coletado / a caminho).
    if (e.status === 'PickedUp' || e.status === 'OnTheWay') {
      this.iniciarGps();
    } else {
      this.pararGps();
    }
  }

  // ── Getters de exibição ──────────────────────────────────────────────────

  get status(): DeliveryStatus | undefined {
    return this.entrega?.status;
  }

  get restauranteNome(): string {
    return this.entrega?.foodOrder?.restaurant?.name ?? '';
  }

  get clienteNome(): string {
    return this.entrega?.foodOrder?.customer?.name ?? '';
  }

  get valor(): number {
    return Number(this.entrega?.foodOrder?.deliveryFee ?? 0);
  }

  get pagamento(): string {
    return this.entrega?.foodOrder?.paymentMethod ?? '';
  }

  get cancelado(): boolean {
    return this.status === 'Cancelled' || this.status === 'Rejected';
  }

  get concluido(): boolean {
    return this.status === 'Delivered';
  }

  get podeColetar(): boolean {
    return this.status === 'Accepted';
  }

  get podeEntregar(): boolean {
    return this.status === 'PickedUp' || this.status === 'OnTheWay';
  }

  get indexAtual(): number {
    return this.status ? STATUS_INDEX[this.status] : 0;
  }

  get labelAtual(): string {
    if (this.cancelado) return 'Entrega cancelada';
    return this.etapas[this.indexAtual]?.label ?? '';
  }

  etapaAtingida(index: number): boolean {
    return !this.cancelado && index <= this.indexAtual;
  }

  get labelBotao(): string {
    if (this.processando) return 'AGUARDE…';
    if (this.concluido || this.cancelado) return 'CONCLUÍDO';
    if (this.podeColetar) return 'CONFIRMAR COLETA';
    if (this.podeEntregar) return 'CONFIRMAR ENTREGA';
    return 'ATUALIZAR';
  }

  // ── Ações ──────────────────────────────────────────────────────────────

  acaoPrincipal() {
    if (this.processando) return;
    if (this.concluido || this.cancelado) {
      this.router.navigate(['/entregador/home']);
      return;
    }
    if (this.podeColetar) {
      this.executar(this.entregadorService.coletar(this.entregaId));
    } else if (this.podeEntregar) {
      this.executar(this.entregadorService.entregar(this.entregaId));
    } else {
      this.carregar();
    }
  }

  private executar(obs: ReturnType<EntregadorService['coletar']>) {
    this.processando = true;
    this.erro = '';
    obs.pipe(finalize(() => (this.processando = false))).subscribe({
      next: (e) => this.aplicar(e),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar a entrega.';
      },
    });
  }

  // ── GPS (navigator.geolocation → PATCH /location) ─────────────────────────

  private iniciarGps() {
    if (this.gpsAtivo || typeof navigator === 'undefined' || !navigator.geolocation) return;
    this.gpsAtivo = true;
    this.enviarPosicao();
    this.gpsTimer = setInterval(() => this.enviarPosicao(), GPS_INTERVAL_MS);
  }

  private enviarPosicao() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.entregadorService
          .enviarLocalizacao(this.entregaId, pos.coords.latitude, pos.coords.longitude)
          .subscribe({ next: () => {}, error: () => {} });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  private pararGps() {
    if (this.gpsTimer) clearInterval(this.gpsTimer);
    this.gpsTimer = undefined;
    this.gpsAtivo = false;
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return this.entregadorService.formatarPreco(valor);
  }
}
