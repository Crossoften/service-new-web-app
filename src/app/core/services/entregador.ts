import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import {
  DeliveryStatus,
  ResponseDeliveryDto,
  ResponseFindAllDeliveryDto,
} from '../models/delivery';

// ─── Interfaces (prontas para integração com API) ───────────────────────────

export interface FaturamentoEntregador {
  dia: number;
  semana: number;
  mes: number;
}

export interface PedidoEntregador {
  id: number;
  numero: string;
  restaurante: string;
  restauranteLogo: string;
  valor: number;
  pagamento: string;
  status: StatusEntrega;
  cliente: string;
  endereco: string;
  bairro: string;
  pendente: boolean;
}

export interface AtividadeEntregador {
  id: number;
  numero: string;
  restaurante: string;
  valor: number;
  status: string;
  data: string;
  hora: string;
}

export type StatusEntrega = 'caminho' | 'retirado' | 'a_caminho_cliente' | 'entregue';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const FATURAMENTO_MOCK: FaturamentoEntregador = {
  dia: 185.00,
  semana: 920.00,
  mes: 3480.00,
};

const PEDIDO_PENDENTE_MOCK: PedidoEntregador = {
  id: 1,
  numero: '6721',
  restaurante: 'Bella Itália Pizzaria',
  restauranteLogo: '',
  valor: 12.00,
  pagamento: 'Pix',
  status: 'caminho',
  cliente: 'João Silva',
  endereco: 'Rua das Palmeiras, 102',
  bairro: 'Centro',
  pendente: true,
};

const ATIVIDADES_MOCK: AtividadeEntregador[] = [
  { id: 1, numero: '6718', restaurante: 'Dona Rita Marmitas', valor: 9.00, status: 'Entregue', data: '13/10', hora: '18:45' },
  { id: 2, numero: '6718', restaurante: 'Dona Rita Marmitas', valor: 9.00, status: 'Entregue', data: '13/10', hora: '18:45' },
  { id: 3, numero: '6718', restaurante: 'Dona Rita Marmitas', valor: 9.00, status: 'Entregue', data: '13/10', hora: '18:45' },
  { id: 4, numero: '6718', restaurante: 'Dona Rita Marmitas', valor: 9.00, status: 'Entregue', data: '13/10', hora: '18:45' },
  { id: 5, numero: '6718', restaurante: 'Dona Rita Marmitas', valor: 9.00, status: 'Entregue', data: '13/10', hora: '18:45' },
];

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EntregadorService {
  private readonly api = inject(ApiService);

  private pedidoPendente: PedidoEntregador | null = { ...PEDIDO_PENDENTE_MOCK };
  private atividades: AtividadeEntregador[] = [...ATIVIDADES_MOCK];
  private statusAtual: StatusEntrega = 'caminho';

  // ── Entregas (API) ─────────────────────────────────────────────────────────

  /** Entregas disponíveis para aceite — `GET /v1/deliveries/available`. */
  entregasDisponiveis(): Observable<PedidoEntregador[]> {
    return this.api
      .get<ResponseFindAllDeliveryDto>('/deliveries/available')
      .pipe(map((r) => (r.deliveries ?? []).map((d) => this.mapPedido(d))));
  }

  /** Minhas entregas (ativas + histórico) — `GET /v1/deliveries/me`. */
  minhasEntregas(): Observable<PedidoEntregador[]> {
    return this.api
      .get<ResponseFindAllDeliveryDto>('/deliveries/me')
      .pipe(map((r) => (r.deliveries ?? []).map((d) => this.mapPedido(d))));
  }

  /** Atividades recentes (histórico) a partir de `GET /v1/deliveries/me`. */
  atividadesRecentes(): Observable<AtividadeEntregador[]> {
    return this.api
      .get<ResponseFindAllDeliveryDto>('/deliveries/me')
      .pipe(map((r) => (r.deliveries ?? []).map((d) => this.mapAtividade(d))));
  }

  /** Detalhe da entrega — `GET /v1/deliveries/{id}`. */
  getEntrega(id: number): Observable<ResponseDeliveryDto> {
    return this.api.get<ResponseDeliveryDto>(`/deliveries/${id}`);
  }

  /** Aceita uma entrega disponível — `PATCH /v1/deliveries/{id}/accept`. */
  aceitar(id: number): Observable<ResponseDeliveryDto> {
    return this.api.patch<ResponseDeliveryDto>(`/deliveries/${id}/accept`, {});
  }

  /** Recusa uma entrega já aceita (volta à fila) — `PATCH /v1/deliveries/{id}/reject`. */
  recusar(id: number): Observable<ResponseDeliveryDto> {
    return this.api.patch<ResponseDeliveryDto>(`/deliveries/${id}/reject`, {});
  }

  /** Confirma a coleta no restaurante — `PATCH /v1/deliveries/{id}/pickup`. */
  coletar(id: number): Observable<ResponseDeliveryDto> {
    return this.api.patch<ResponseDeliveryDto>(`/deliveries/${id}/pickup`, {});
  }

  /** Confirma a entrega ao cliente — `PATCH /v1/deliveries/{id}/deliver`. */
  entregar(id: number): Observable<ResponseDeliveryDto> {
    return this.api.patch<ResponseDeliveryDto>(`/deliveries/${id}/deliver`, {});
  }

  /** Atualiza a localização (GPS) — `PATCH /v1/deliveries/{id}/location`. */
  enviarLocalizacao(id: number, lat: number, lng: number): Observable<ResponseDeliveryDto> {
    return this.api.patch<ResponseDeliveryDto>(`/deliveries/${id}/location`, { lat, lng });
  }

  // ── Mapeadores API → view-model ──────────────────────────────────────────

  /** Rótulo pt-BR do status da entrega. */
  statusLabel(status: DeliveryStatus): string {
    const labels: Record<DeliveryStatus, string> = {
      Pending: 'Disponível',
      Accepted: 'Aceito',
      Rejected: 'Recusado',
      PickedUp: 'Coletado',
      OnTheWay: 'A caminho',
      Delivered: 'Entregue',
      Cancelled: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  private mapPedido(d: ResponseDeliveryDto): PedidoEntregador {
    const o = d.foodOrder;
    return {
      id: d.id,
      numero: String(o?.id ?? d.id),
      restaurante: o?.restaurant?.name ?? '',
      restauranteLogo: o?.restaurant?.imageUrl ?? '',
      valor: Number(o?.deliveryFee ?? 0),
      pagamento: o?.paymentMethod ?? '',
      status: this.mapStatus(d.status),
      cliente: o?.customer?.name ?? '',
      endereco: '', // BE-D2: pedido/entrega ainda não traz endereço de destino
      bairro: '',
      pendente: d.status === 'Pending',
    };
  }

  private mapAtividade(d: ResponseDeliveryDto): AtividadeEntregador {
    const data = (d.deliveredAt ?? d.updatedAt ?? '').slice(0, 10);
    const hora = (d.deliveredAt ?? d.updatedAt ?? '').slice(11, 16);
    return {
      id: d.id,
      numero: String(d.foodOrder?.id ?? d.id),
      restaurante: d.foodOrder?.restaurant?.name ?? '',
      valor: Number(d.foodOrder?.deliveryFee ?? 0),
      status: this.statusLabel(d.status),
      data,
      hora,
    };
  }

  private mapStatus(status: DeliveryStatus): StatusEntrega {
    switch (status) {
      case 'PickedUp':
        return 'retirado';
      case 'OnTheWay':
        return 'a_caminho_cliente';
      case 'Delivered':
        return 'entregue';
      default:
        return 'caminho'; // Pending / Accepted
    }
  }

  // ── Faturamento ───────────────────────────────────────────────────────────

  getFaturamento(): FaturamentoEntregador {
    // Futuramente: return this.http.get<FaturamentoEntregador>('/api/entregador/faturamento')
    return FATURAMENTO_MOCK;
  }

  // ── Pedido pendente ───────────────────────────────────────────────────────

  getPedidoPendente(): PedidoEntregador | null {
    // Futuramente: return this.http.get<PedidoEntregador>('/api/entregador/pedido-pendente')
    return this.pedidoPendente;
  }

  aceitarPedido(): PedidoEntregador {
    // Futuramente: return this.http.post('/api/entregador/pedidos/aceitar', { id })
    this.statusAtual = 'caminho';
    return this.pedidoPendente!;
  }

  recusarPedido(): void {
    // Futuramente: return this.http.post('/api/entregador/pedidos/recusar', { id })
    this.pedidoPendente = null;
  }

  // ── Status da entrega ─────────────────────────────────────────────────────

  getStatusAtual(): StatusEntrega {
    return this.statusAtual;
  }

  avancarStatus(): StatusEntrega {
    const sequencia: StatusEntrega[] = ['caminho', 'retirado', 'a_caminho_cliente', 'entregue'];
    const indexAtual = sequencia.indexOf(this.statusAtual);
    if (indexAtual < sequencia.length - 1) {
      this.statusAtual = sequencia[indexAtual + 1];
    }
    return this.statusAtual;
  }

  getPedidoAtivo(): PedidoEntregador | null {
    return this.pedidoPendente;
  }

  // ── Atividades ────────────────────────────────────────────────────────────

  getAtividades(): AtividadeEntregador[] {
    // Futuramente: return this.http.get<AtividadeEntregador[]>('/api/entregador/atividades')
    return this.atividades;
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}