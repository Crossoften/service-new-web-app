import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api';
import {
  CreateRestaurantReviewDto,
  ResponseFindAllRestaurantDto,
  ResponseMenuCategoryDto,
  ResponseMenuItemDto,
  ResponseRestaurantCategoryDto,
  ResponseRestaurantDto,
} from '../models/restaurant';
import { ApiMessage } from '../models/common';
import {
  CreateFoodOrderDto,
  CreateFoodOrderResponseDto,
  PayFoodOrderResponseDto,
  ResponseFindAllFoodOrderDto,
  ResponseFoodOrderDto,
} from '../models/food-order';
import { FoodOrderStatus } from '../models/food-order';
import { PaymentMethod } from '../models/enums';

// ─── View-models do Front (pt) — populados a partir dos DTOs da API ─────────

export interface Adicional {
  id: number; // = menuItemAddition.id (additionId)
  nome: string;
  preco: number;
  selecionado?: boolean;
}

export interface ItemCardapio {
  id: number; // = menuItem.id (menuItemId)
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  adicionais: Adicional[];
}

export interface CategoriaCardapio {
  id: number; // = menuCategory.id
  nome: string;
  itens: ItemCardapio[];
}

export interface Restaurante {
  id: number;
  nome: string;
  avaliacao: number; // média (ratingAverage); 0 quando ninguém avaliou
  totalAvaliacoes: number; // ratingCount
  tempo: string; // (BE-D1)
  tempoMinMinutos?: number; // deliveryTimeMinMinutes — para ordenar por tempo
  taxaEntrega: number; // (BE-D1)
  aberto: boolean; // isOpen — para o filtro "aberto agora"
  descricao: string;
  imagem: string;
  logo: string; // (BE-D1)
  categorias: CategoriaCardapio[];
}

export interface ItemPedido {
  item: ItemCardapio;
  quantidade: number;
  adicionaisSelecionados: Adicional[];
  observacao?: string; // ex.: "sem cebola" → vira `notes` no item do pedido
}

export interface OpcaoEntrega {
  id: string;
  nome: string;
  preco: number;
}

export type FormaPagamento = 'credito' | 'debito' | 'pix' | 'boleto' | 'dinheiro';

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

export const OPCOES_ENTREGA: OpcaoEntrega[] = [
  { id: 'padrao', nome: 'Padrão', preco: 0 },
  { id: 'express', nome: 'Express', preco: 20.0 },
];

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Delivery Cliente. Catálogo integrado à API (DC-1); carrinho em memória.
 * Checkout (`POST /food-orders`) e acompanhamento entram nas fatias DC-2/DC-3.
 */
@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly api = inject(ApiService);

  // Pedido em construção (carrinho)
  private pedidoAtual: Partial<Pedido> = {};

  // ── Catálogo (API) ──────────────────────────────────────────────────────

  /** Categorias reais — `GET /v1/restaurants/categories`. */
  getCategorias(): Observable<ResponseRestaurantCategoryDto[]> {
    return this.api.get<ResponseRestaurantCategoryDto[]>('/restaurants/categories');
  }

  /** Restaurantes ativos (filtra por categoria) — `GET /v1/restaurants`. */
  getRestaurantes(categoryId?: number): Observable<Restaurante[]> {
    return this.api
      .get<ResponseFindAllRestaurantDto>('/restaurants', { categoryId: categoryId ?? null, take: 50 })
      .pipe(map((res) => (res.restaurants ?? []).map((r) => this.mapRestaurante(r))));
  }

  /** Restaurante + cardápio — `GET /v1/restaurants/{id}`. */
  getRestaurante(id: number): Observable<Restaurante> {
    return this.api.get<ResponseRestaurantDto>(`/restaurants/${id}`).pipe(map((r) => this.mapRestaurante(r)));
  }

  /**
   * Avalia um restaurante — `POST /v1/restaurants/{id}/reviews`.
   * Só quem tem pedido entregue pode avaliar (`403`); uma avaliação por cliente (`409`).
   */
  avaliarRestaurante(id: number, dto: CreateRestaurantReviewDto): Observable<ApiMessage> {
    return this.api.post<ApiMessage>(`/restaurants/${id}/reviews`, dto);
  }

  /** Item específico dentro do cardápio do restaurante. */
  getItem(restauranteId: number, itemId: number): Observable<ItemCardapio | undefined> {
    return this.getRestaurante(restauranteId).pipe(
      map((r) => r.categorias.flatMap((c) => c.itens).find((i) => i.id === itemId)),
    );
  }

  // ── Carrinho (memória) ────────────────────────────────────────────────────

  setPedidoRestaurante(restaurante: Restaurante) {
    this.pedidoAtual.restaurante = restaurante;
    this.pedidoAtual.itens = [];
  }

  addItem(item: ItemCardapio, quantidade: number, adicionais: Adicional[], observacao?: string) {
    if (!this.pedidoAtual.itens) this.pedidoAtual.itens = [];
    this.pedidoAtual.itens.push({ item, quantidade, adicionaisSelecionados: adicionais, observacao });
  }

  /** Ajusta a quantidade de uma linha da sacola (mínimo 1). */
  alterarQuantidade(index: number, delta: number) {
    const linha = this.pedidoAtual.itens?.[index];
    if (!linha) return;
    linha.quantidade = Math.max(1, linha.quantidade + delta);
  }

  /** Remove uma linha da sacola. */
  removerItem(index: number) {
    this.pedidoAtual.itens?.splice(index, 1);
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

  /** Cria o pedido — `POST /v1/food-orders`. Limpa o carrinho em caso de sucesso. */
  criarPedido(): Observable<CreateFoodOrderResponseDto> {
    return this.api
      .post<CreateFoodOrderResponseDto>('/food-orders', this.buildCreateFoodOrderDto())
      .pipe(tap(() => (this.pedidoAtual = {})));
  }

  private buildCreateFoodOrderDto(): CreateFoodOrderDto {
    const itens = this.pedidoAtual.itens ?? [];
    return {
      // `deliveryFee` não é mais enviado (Fase C): o servidor calcula o frete.
      restaurantId: this.pedidoAtual.restaurante?.id ?? 0,
      paymentMethod: this.paymentMethodApi(this.pedidoAtual.formaPagamento ?? 'credito'),
      items: itens.map((ip) => ({
        menuItemId: ip.item.id,
        quantity: ip.quantidade,
        additionIds: ip.adicionaisSelecionados.map((a) => a.id),
        notes: ip.observacao?.trim() || undefined,
      })),
    };
  }

  /** Mapeia a forma de pagamento do front para o `PaymentMethodEnum` da API (5 valores, Fase C). */
  private paymentMethodApi(forma: FormaPagamento): PaymentMethod {
    switch (forma) {
      case 'debito':
        return 'DebitCard';
      case 'pix':
        return 'Pix';
      case 'boleto':
        return 'BankSlip';
      case 'dinheiro':
        return 'Cash';
      default:
        return 'CreditCard';
    }
  }

  // ── Acompanhamento (API) ──────────────────────────────────────────────────

  /** Detalhe/rastreio de um pedido — `GET /v1/food-orders/{id}`. */
  getPedido(id: number): Observable<ResponseFoodOrderDto> {
    return this.api.get<ResponseFoodOrderDto>(`/food-orders/${id}`);
  }

  /** Lista os pedidos do usuário — `GET /v1/food-orders`. */
  getMeusPedidos(status?: FoodOrderStatus): Observable<ResponseFoodOrderDto[]> {
    return this.api
      .get<ResponseFindAllFoodOrderDto>('/food-orders', { status: status ?? null, take: 50 })
      .pipe(map((res) => res.foodOrders ?? []));
  }

  /**
   * Gera o checkout de pagamento (Mercado Pago) de um pedido não-dinheiro —
   * `POST /v1/food-orders/{id}/pay`. A confirmação vem depois, via webhook: o
   * front leva o cliente à `checkoutUrl` e reconsulta o pedido para ver `Paid`.
   */
  pagarPedido(id: number, payerEmail?: string): Observable<PayFoodOrderResponseDto> {
    return this.api.post<PayFoodOrderResponseDto>(
      `/food-orders/${id}/pay`,
      payerEmail ? { payerEmail } : {},
    );
  }

  /** Cancela um pedido — `PATCH /v1/food-orders/{id}/cancel`. */
  cancelarPedido(id: number, cancelReason: string): Observable<ResponseFoodOrderDto> {
    return this.api.patch<ResponseFoodOrderDto>(`/food-orders/${id}/cancel`, { cancelReason });
  }

  // ── Mapeadores API → view-model ───────────────────────────────────────────

  /** "30-45 min" (ou "30 min" quando iguais). Vazio quando não informado. */
  private formatarTempoEntrega(min?: number, max?: number): string {
    if (min == null && max == null) return '';
    const a = min ?? max!;
    const b = max ?? min!;
    return a === b ? `${a} min` : `${a}-${b} min`;
  }

  private mapRestaurante(r: ResponseRestaurantDto): Restaurante {
    return {
      id: r.id,
      nome: r.name,
      avaliacao: r.ratingAverage ?? r.rating ?? 0,
      totalAvaliacoes: r.ratingCount ?? 0,
      tempo: this.formatarTempoEntrega(r.deliveryTimeMinMinutes, r.deliveryTimeMaxMinutes) || (r.estimatedTime ?? ''),
      tempoMinMinutos: r.deliveryTimeMinMinutes,
      taxaEntrega: r.deliveryFee ?? 0,
      aberto: r.isOpen ?? true,
      descricao: r.description ?? '',
      imagem: r.imageUrl ?? '',
      logo: r.logoUrl ?? '',
      categorias: [...(r.menuCategories ?? [])]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => this.mapCategoria(c)),
    };
  }

  private mapCategoria(c: ResponseMenuCategoryDto): CategoriaCardapio {
    return { id: c.id, nome: c.name, itens: (c.items ?? []).map((i) => this.mapItem(i)) };
  }

  private mapItem(i: ResponseMenuItemDto): ItemCardapio {
    return {
      id: i.id,
      nome: i.name,
      descricao: i.description ?? '',
      preco: Number(i.price),
      imagem: i.imageUrl ?? '',
      adicionais: (i.additions ?? [])
        .filter((a) => a.isActive)
        .map((a) => ({ id: a.id, nome: a.name, preco: Number(a.price) })),
    };
  }
}
