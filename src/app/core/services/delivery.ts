import { Injectable } from '@angular/core';

// ─── Interfaces (prontas para integração com API) ───────────────────────────

export interface Adicional {
  id: number;
  nome: string;
  preco: number;
  selecionado?: boolean;
}

export interface ItemCardapio {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  adicionais: Adicional[];
}

export interface CategoriaCardapio {
  id: number;
  nome: string;
  itens: ItemCardapio[];
}

export interface Restaurante {
  id: number;
  nome: string;
  avaliacao: number;
  tempo: string;
  taxaEntrega: number;
  descricao: string;
  imagem: string;
  logo: string;
  categorias: CategoriaCardapio[];
}

export interface ItemPedido {
  item: ItemCardapio;
  quantidade: number;
  adicionaisSelecionados: Adicional[];
}

export interface OpcaoEntrega {
  id: string;
  nome: string;
  preco: number;
}

export type FormaPagamento = 'credito' | 'debito' | 'pix' | 'dinheiro';

export type StatusPedido = 'recebido' | 'preparo' | 'caminho' | 'entregue';

export interface Pedido {
  id: number;
  restaurante: Restaurante;
  itens: ItemPedido[];
  endereco: string;
  bairro: string;
  opcaoEntrega: OpcaoEntrega;
  formaPagamento: FormaPagamento;
  total: number;
  data: string;
  status: StatusPedido;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ADICIONAIS_MOCK: Adicional[] = [
  { id: 1, nome: 'Azeitona', preco: 2.00 },
  { id: 2, nome: 'Cebola extra', preco: 2.00 },
  { id: 3, nome: 'Pimenta', preco: 2.00 },
  { id: 4, nome: 'Orégano extra', preco: 2.00 },
];

const RESTAURANTES_MOCK: Restaurante[] = [
  {
    id: 1,
    nome: 'Pizzaria Bella Itália',
    avaliacao: 4.7,
    tempo: '35-45 min',
    taxaEntrega: 4.99,
    descricao: 'Pizzas artesanais feitas no forno a lenha com massa crocante',
    imagem: '',
    logo: '',
    categorias: [
      {
        id: 1,
        nome: 'Destaques',
        itens: [
          {
            id: 1,
            nome: 'BACON',
            descricao: 'Molho de tomate, bacon, mussarela, alho, cebola e salsinha.',
            preco: 42.90,
            imagem: '',
            adicionais: ADICIONAIS_MOCK
          },
          {
            id: 2,
            nome: 'FRANGO COM CATUPIRY',
            descricao: 'Molho de tomate, frango desfiado, catupiry e orégano.',
            preco: 45.90,
            imagem: '',
            adicionais: ADICIONAIS_MOCK
          },
          {
            id: 3,
            nome: 'PORTUGUESA',
            descricao: 'Molho de tomate, presunto, ovo, cebola, pimentão e azeitona.',
            preco: 44.90,
            imagem: '',
            adicionais: ADICIONAIS_MOCK
          },
        ]
      },
      {
        id: 2,
        nome: 'Pizza Salgada',
        itens: [
          {
            id: 4,
            nome: 'CALABRESA',
            descricao: 'Molho de tomate, calabresa fatiada, cebola e orégano.',
            preco: 39.90,
            imagem: '',
            adicionais: ADICIONAIS_MOCK
          },
        ]
      },
      {
        id: 3,
        nome: 'Pizza Doce',
        itens: [
          {
            id: 5,
            nome: 'CHOCOLATE',
            descricao: 'Chocolate ao leite, morango e granulado.',
            preco: 38.90,
            imagem: '',
            adicionais: []
          },
        ]
      },
    ]
  },
  {
    id: 2,
    nome: 'Pizzaria Bella Itália',
    avaliacao: 4.7,
    tempo: '35-45 min',
    taxaEntrega: 4.99,
    descricao: 'Pizzas artesanais feitas no forno a lenha com massa crocante',
    imagem: '',
    logo: '',
    categorias: []
  },
  {
    id: 3,
    nome: 'Pizzaria Bella Itália',
    avaliacao: 4.7,
    tempo: '35-45 min',
    taxaEntrega: 4.99,
    descricao: 'Pizzas artesanais feitas no forno a lenha com massa crocante',
    imagem: '',
    logo: '',
    categorias: []
  },
];

export const OPCOES_ENTREGA: OpcaoEntrega[] = [
  { id: 'padrao', nome: 'Padrão', preco: 0 },
  { id: 'express', nome: 'Express', preco: 20.00 },
];

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DeliveryService {

  // Pedido em construção (carrinho)
  private pedidoAtual: Partial<Pedido> = {};

  // ── Restaurantes ──────────────────────────────────────────────────────────

  getRestaurantes(categoria?: string): Restaurante[] {
    // Futuramente: return this.http.get<Restaurante[]>(`/api/delivery/restaurantes?categoria=${categoria}`)
    return RESTAURANTES_MOCK;
  }

  getRestaurante(id: number): Restaurante | undefined {
    // Futuramente: return this.http.get<Restaurante>(`/api/delivery/restaurantes/${id}`)
    return RESTAURANTES_MOCK.find(r => r.id === id);
  }

  getItem(restauranteId: number, itemId: number): ItemCardapio | undefined {
    const restaurante = this.getRestaurante(restauranteId);
    return restaurante?.categorias
      .flatMap(c => c.itens)
      .find(i => i.id === itemId);
  }

  // ── Carrinho ──────────────────────────────────────────────────────────────

  setPedidoRestaurante(restaurante: Restaurante) {
    this.pedidoAtual.restaurante = restaurante;
    this.pedidoAtual.itens = [];
  }

  addItem(item: ItemCardapio, quantidade: number, adicionais: Adicional[]) {
    if (!this.pedidoAtual.itens) this.pedidoAtual.itens = [];
    this.pedidoAtual.itens.push({ item, quantidade, adicionaisSelecionados: adicionais });
  }

  getPedidoAtual(): Partial<Pedido> {
    return this.pedidoAtual;
  }

  setEndereco(endereco: string, bairro: string) {
    this.pedidoAtual.endereco = endereco;
    this.pedidoAtual.bairro = bairro;
  }

  setOpcaoEntrega(opcao: OpcaoEntrega) {
    this.pedidoAtual.opcaoEntrega = opcao;
  }

  setFormaPagamento(forma: FormaPagamento) {
    this.pedidoAtual.formaPagamento = forma;
  }

  calcularTotal(): number {
    const itens = this.pedidoAtual.itens ?? [];
    const subtotal = itens.reduce((acc, i) => {
      const extras = i.adicionaisSelecionados.reduce((a, ad) => a + ad.preco, 0);
      return acc + (i.item.preco + extras) * i.quantidade;
    }, 0);
    const frete = this.pedidoAtual.opcaoEntrega?.preco ?? 0;
    return subtotal + frete;
  }

  finalizarPedido(): Pedido {
    // Futuramente: return this.http.post<Pedido>('/api/delivery/pedidos', this.pedidoAtual)
    const pedido: Pedido = {
      id: Math.floor(Math.random() * 10000),
      restaurante: this.pedidoAtual.restaurante!,
      itens: this.pedidoAtual.itens ?? [],
      endereco: this.pedidoAtual.endereco ?? '',
      bairro: this.pedidoAtual.bairro ?? '',
      opcaoEntrega: this.pedidoAtual.opcaoEntrega ?? OPCOES_ENTREGA[0],
      formaPagamento: this.pedidoAtual.formaPagamento ?? 'credito',
      total: this.calcularTotal(),
      data: new Date().toLocaleDateString('pt-BR'),
      status: 'recebido'
    };
    this.pedidoAtual = {};
    return pedido;
  }
}