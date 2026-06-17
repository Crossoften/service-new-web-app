import { Injectable } from '@angular/core';

// ─── Interfaces (prontas para integração com API) ───────────────────────────

export interface ItemCardapioFornecedor {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  categoria: string;
  imagem: string;
}

export type StatusPedidoFornecedor = 'recebido' | 'preparo' | 'caminho' | 'entregue' | 'cancelado';

export interface PedidoFornecedor {
  id: number;
  numero: string;
  cliente: string;
  item: string;
  descricaoItem: string;
  pagamento: string;
  endereco: string;
  bairro: string;
  total: number;
  status: StatusPedidoFornecedor;
  adicionais: { nome: string; valor: number }[];
}

export interface FaturamentoFornecedor {
  dia: number;
  semana: number;
  mes: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CARDAPIO_MOCK: ItemCardapioFornecedor[] = [
  {
    id: 1,
    nome: 'BACON',
    descricao: 'Molho de tomate, bacon, mussarela, alho, cebola e salsinha.',
    valor: 42.90,
    categoria: 'Destaques',
    imagem: ''
  },
  {
    id: 2,
    nome: 'FRANGO COM CATUPIRY',
    descricao: 'Molho de tomate, frango desfiado, catupiry e orégano.',
    valor: 45.90,
    categoria: 'Destaques',
    imagem: ''
  },
  {
    id: 3,
    nome: 'PORTUGUESA',
    descricao: 'Molho de tomate, presunto, ovo, cebola, pimentão e azeitona.',
    valor: 44.90,
    categoria: 'Pizza Salgada',
    imagem: ''
  },
  {
    id: 4,
    nome: 'CALABRESA',
    descricao: 'Molho de tomate, calabresa fatiada, cebola e orégano.',
    valor: 39.90,
    categoria: 'Pizza Salgada',
    imagem: ''
  },
  {
    id: 5,
    nome: 'CHOCOLATE',
    descricao: 'Chocolate ao leite, morango e granulado.',
    valor: 38.90,
    categoria: 'Pizza Doce',
    imagem: ''
  },
];

const PEDIDOS_MOCK: PedidoFornecedor[] = [
  {
    id: 1,
    numero: '4210',
    cliente: 'João Silva',
    item: 'Pizza de Bacon + Azeitona',
    descricaoItem: 'Molho de tomate, bacon, mussarela, alho, cebola e salsinha.',
    pagamento: 'Pix',
    endereco: 'Rua das Palmeiras, 102',
    bairro: 'Centro',
    total: 48.90,
    status: 'preparo',
    adicionais: [
      { nome: 'Azeitona', valor: 2.00 },
      { nome: 'Azeitona', valor: 2.00 },
    ]
  },
  {
    id: 2,
    numero: '4211',
    cliente: 'Maria Santos',
    item: 'Pizza de Frango',
    descricaoItem: 'Molho de tomate, frango desfiado, catupiry e orégano.',
    pagamento: 'Cartão de Crédito',
    endereco: 'Rua das Flores, 55',
    bairro: 'Jardim',
    total: 45.90,
    status: 'recebido',
    adicionais: []
  },
  {
    id: 3,
    numero: '4212',
    cliente: 'Carlos Oliveira',
    item: 'Pizza Portuguesa',
    descricaoItem: 'Molho de tomate, presunto, ovo, cebola, pimentão e azeitona.',
    pagamento: 'Dinheiro',
    endereco: 'Av. Brasil, 200',
    bairro: 'Centro',
    total: 44.90,
    status: 'caminho',
    adicionais: []
  },
];

const FATURAMENTO_MOCK: FaturamentoFornecedor = {
  dia: 1250.00,
  semana: 8640.00,
  mes: 31780.00,
};

const CATEGORIAS_MOCK = ['Destaques', 'Pizza Salgada', 'Pizza Doce', 'Bebidas'];

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FornecedorService {

  private cardapio: ItemCardapioFornecedor[] = [...CARDAPIO_MOCK];
  private pedidos: PedidoFornecedor[] = [...PEDIDOS_MOCK];

  // ── Faturamento ───────────────────────────────────────────────────────────

  getFaturamento(): FaturamentoFornecedor {
    // Futuramente: return this.http.get<FaturamentoFornecedor>('/api/fornecedor/faturamento')
    return FATURAMENTO_MOCK;
  }

  // ── Cardápio ──────────────────────────────────────────────────────────────

  getCardapio(): ItemCardapioFornecedor[] {
    // Futuramente: return this.http.get<ItemCardapioFornecedor[]>('/api/fornecedor/cardapio')
    return this.cardapio;
  }

  getItem(id: number): ItemCardapioFornecedor | undefined {
    return this.cardapio.find(i => i.id === id);
  }

  getCategorias(): string[] {
    // Futuramente: return this.http.get<string[]>('/api/fornecedor/categorias')
    return CATEGORIAS_MOCK;
  }

  salvarItem(item: Partial<ItemCardapioFornecedor>): void {
    // Futuramente: return this.http.post('/api/fornecedor/cardapio', item)
    if (item.id) {
      const index = this.cardapio.findIndex(i => i.id === item.id);
      if (index >= 0) this.cardapio[index] = { ...this.cardapio[index], ...item };
    } else {
      const novoItem: ItemCardapioFornecedor = {
        id: this.cardapio.length + 1,
        nome: item.nome ?? '',
        descricao: item.descricao ?? '',
        valor: item.valor ?? 0,
        categoria: item.categoria ?? '',
        imagem: item.imagem ?? '',
      };
      this.cardapio.push(novoItem);
    }
  }

  removerItem(id: number): void {
    // Futuramente: return this.http.delete(`/api/fornecedor/cardapio/${id}`)
    this.cardapio = this.cardapio.filter(i => i.id !== id);
  }

  // ── Pedidos ───────────────────────────────────────────────────────────────

  getPedidos(): PedidoFornecedor[] {
    // Futuramente: return this.http.get<PedidoFornecedor[]>('/api/fornecedor/pedidos')
    return this.pedidos;
  }

  getPedido(id: number): PedidoFornecedor | undefined {
    // Futuramente: return this.http.get<PedidoFornecedor>(`/api/fornecedor/pedidos/${id}`)
    return this.pedidos.find(p => p.id === id);
  }

  atualizarStatus(id: number, status: StatusPedidoFornecedor): void {
    // Futuramente: return this.http.patch(`/api/fornecedor/pedidos/${id}`, { status })
    const pedido = this.pedidos.find(p => p.id === id);
    if (pedido) pedido.status = status;
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}