import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from './api';
import {
  CreateMenuCategoryDto,
  CreateMenuItemDto,
  CreateRestaurantDto,
  CreateRestaurantResponseDto,
  ResponseMenuCategoryDto,
  ResponseRestaurantDto,
  ResponseRestaurantPayoutDto,
  UpdateMenuItemDto,
  UpdateRestaurantDto,
} from '../models/restaurant';
import {
  FoodOrderStatus,
  ResponseFindAllFoodOrderDto,
  ResponseFoodOrderDto,
} from '../models/food-order';
import { PaymentMethod } from '../models/enums';

// ─── View-models do Front (pt) ──────────────────────────────────────────────

export interface ItemCardapioFornecedor {
  id: number; // = menuItem.id
  nome: string;
  descricao: string;
  valor: number;
  categoria: string; // nome da categoria (exibição)
  categoriaId?: number; // = menuCategory.id (para editar/criar)
  imagem: string;
}

export interface CategoriaCardapioFornecedor {
  id: number;
  nome: string;
}

/** Payload de gravação de item vindo da tela. */
export interface SalvarItemInput {
  id?: number;
  nome: string;
  descricao: string;
  valor: number;
  categoriaId: number;
  imagem?: string;
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

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Delivery Fornecedor. Restaurante + cardápio integrados à API (DF-1).
 * Pedidos e faturamento seguem mock até o DF-2.
 */
@Injectable({ providedIn: 'root' })
export class FornecedorService {
  private readonly api = inject(ApiService);

  // ── Restaurante (API) ─────────────────────────────────────────────────────

  /** Restaurante do fornecedor — `GET /v1/restaurants/me` (null se ainda não existir). */
  meuRestaurante(): Observable<ResponseRestaurantDto | null> {
    return this.api.get<ResponseRestaurantDto>('/restaurants/me').pipe(catchError(() => of(null)));
  }

  /** Cria o restaurante — `POST /v1/restaurants`. */
  criarRestaurante(dto: CreateRestaurantDto): Observable<CreateRestaurantResponseDto> {
    return this.api.post<CreateRestaurantResponseDto>('/restaurants', dto);
  }

  /** Atualiza o restaurante — `PATCH /v1/restaurants/{id}`. */
  atualizarRestaurante(id: number, dto: UpdateRestaurantDto): Observable<ResponseRestaurantDto> {
    return this.api.patch<ResponseRestaurantDto>(`/restaurants/${id}`, dto);
  }

  /** Abre/fecha a loja — `PATCH /v1/restaurants/{id}` `{isOpen}`. */
  definirAberto(id: number, isOpen: boolean): Observable<ResponseRestaurantDto> {
    return this.atualizarRestaurante(id, { isOpen });
  }

  // ── Cardápio (API) ────────────────────────────────────────────────────────

  /** Itens do cardápio (achatados a partir do restaurante). */
  getCardapio(): Observable<ItemCardapioFornecedor[]> {
    return this.meuRestaurante().pipe(map((r) => (r ? this.itensDe(r) : [])));
  }

  /** Categorias do cardápio do restaurante. */
  getCategorias(): Observable<CategoriaCardapioFornecedor[]> {
    return this.meuRestaurante().pipe(
      map((r) => (r?.menuCategories ?? []).map((c) => ({ id: c.id, nome: c.name }))),
    );
  }

  getItem(id: number): Observable<ItemCardapioFornecedor | undefined> {
    return this.getCardapio().pipe(map((lista) => lista.find((i) => i.id === id)));
  }

  /** Cria uma categoria de cardápio — `POST /v1/restaurants/menu-categories`. */
  criarCategoria(dto: CreateMenuCategoryDto): Observable<ResponseMenuCategoryDto> {
    return this.api.post<ResponseMenuCategoryDto>('/restaurants/menu-categories', dto);
  }

  /** Cria/edita um item — `POST`/`PATCH /v1/restaurants/menu-items`. */
  salvarItem(input: SalvarItemInput): Observable<unknown> {
    if (input.id) {
      const dto: UpdateMenuItemDto = {
        name: input.nome,
        description: input.descricao,
        price: input.valor,
        menuCategoryId: input.categoriaId,
        imageUrl: input.imagem || undefined,
      };
      return this.api.patch(`/restaurants/menu-items/${input.id}`, dto);
    }
    const dto: CreateMenuItemDto = {
      name: input.nome,
      description: input.descricao,
      price: input.valor,
      menuCategoryId: input.categoriaId,
      imageUrl: input.imagem || undefined,
    };
    return this.api.post('/restaurants/menu-items', dto);
  }

  /** Desativa um item (soft-delete) — `PATCH /v1/restaurants/menu-items/{id}` `{isActive:false}`. */
  desativarItem(id: number): Observable<unknown> {
    return this.api.patch(`/restaurants/menu-items/${id}`, { isActive: false });
  }

  /** Achata `menuCategories→items` (ativos) do restaurante em view-models. */
  itensDe(r: ResponseRestaurantDto): ItemCardapioFornecedor[] {
    return (r.menuCategories ?? []).flatMap((c) =>
      (c.items ?? [])
        .filter((i) => i.isActive)
        .map((i) => ({
          id: i.id,
          nome: i.name,
          descricao: i.description ?? '',
          valor: Number(i.price),
          categoria: c.name,
          categoriaId: c.id,
          imagem: i.imageUrl ?? '',
        })),
    );
  }

  // ── Pedidos recebidos (API) ─────────────────────────────────────────────────

  /** Payout/repasse do restaurante — `GET /v1/restaurants/me/payouts`. */
  getPayout(): Observable<ResponseRestaurantPayoutDto> {
    return this.api.get<ResponseRestaurantPayoutDto>('/restaurants/me/payouts');
  }

  /** Pedidos recebidos pelo restaurante — `GET /v1/food-orders` (view-model). */
  getPedidosRecebidos(status?: FoodOrderStatus): Observable<PedidoFornecedor[]> {
    return this.api
      .get<ResponseFindAllFoodOrderDto>('/food-orders', { status: status ?? null, take: 50 })
      .pipe(map((res) => (res.foodOrders ?? []).map((o) => this.mapPedido(o))));
  }

  /** Detalhe do pedido — `GET /v1/food-orders/{id}`. */
  getPedidoRecebido(id: number): Observable<ResponseFoodOrderDto> {
    return this.api.get<ResponseFoodOrderDto>(`/food-orders/${id}`);
  }

  /** Aceita ou recusa um pedido — `PATCH /v1/food-orders/{id}/respond`. */
  responderPedido(id: number, status: 'Accepted' | 'Cancelled'): Observable<ResponseFoodOrderDto> {
    return this.api.patch<ResponseFoodOrderDto>(`/food-orders/${id}/respond`, { status });
  }

  /** Marca o pedido como em preparo — `PATCH /v1/food-orders/{id}/preparing`. */
  marcarPreparo(id: number): Observable<ResponseFoodOrderDto> {
    return this.api.patch<ResponseFoodOrderDto>(`/food-orders/${id}/preparing`, {});
  }

  private mapPedido(o: ResponseFoodOrderDto): PedidoFornecedor {
    const primeiro = o.items?.[0];
    const extras = (o.items?.length ?? 0) - 1;
    return {
      id: o.id,
      numero: String(o.id),
      cliente: o.customer?.name ?? '',
      item: primeiro ? `${primeiro.name}${extras > 0 ? ` +${extras}` : ''}` : '',
      descricaoItem: primeiro?.notes ?? '',
      pagamento: this.pagamentoLabel(o.paymentMethod),
      endereco: '',
      bairro: '',
      total: Number(o.totalValue),
      status: this.statusPt(o.status),
      adicionais: [],
    };
  }

  private statusPt(status: FoodOrderStatus): StatusPedidoFornecedor {
    switch (status) {
      case 'Preparing':
        return 'preparo';
      case 'OnTheWay':
        return 'caminho';
      case 'Delivered':
        return 'entregue';
      case 'Cancelled':
        return 'cancelado';
      default:
        return 'recebido'; // Received / Accepted
    }
  }

  private pagamentoLabel(metodo: PaymentMethod): string {
    if (metodo === 'Pix') return 'PIX';
    if (metodo === 'BankSlip') return 'Boleto';
    return 'Cartão de Crédito';
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
