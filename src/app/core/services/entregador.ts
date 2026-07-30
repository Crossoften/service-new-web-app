import { Injectable } from '@angular/core';

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

  private pedidoPendente: PedidoEntregador | null = { ...PEDIDO_PENDENTE_MOCK };
  private atividades: AtividadeEntregador[] = [...ATIVIDADES_MOCK];
  private statusAtual: StatusEntrega = 'caminho';

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