import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService } from '../../../../core/services/delivery';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../../core/models/food-order';
import { ApiError } from '../../../../core/models/common';

const STATUS_LABEL: Record<FoodOrderStatus, string> = {
  Received: 'Recebido',
  Accepted: 'Confirmado',
  Preparing: 'Em preparo',
  OnTheWay: 'A caminho',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

/** Lista os pedidos de delivery do usuário — `GET /v1/food-orders`. */
@Component({
  selector: 'app-pedidos-delivery',
  imports: [CommonModule],
  templateUrl: './pedidos-delivery.html',
  styleUrl: './pedidos-delivery.scss',
})
export class PedidosDeliveryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  pedidos: ResponseFoodOrderDto[] = [];
  carregando = false;
  erro = '';
  repetindoId: number | null = null;
  aviso = '';

  ngOnInit() {
    this.carregando = true;
    this.deliveryService.getMeusPedidos().subscribe({
      next: (lista) => {
        this.carregando = false;
        this.pedidos = lista;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar seus pedidos.';
      },
    });
  }

  statusLabel(status: FoodOrderStatus): string {
    return STATUS_LABEL[status] ?? status;
  }

  abrir(pedido: ResponseFoodOrderDto) {
    this.router.navigate(['/delivery/status', pedido.id]);
  }

  /** Refaz o pedido: remonta a sacola pelo cardápio atual e vai para a sacola. */
  pedirNovamente(pedido: ResponseFoodOrderDto, event: Event) {
    event.stopPropagation(); // não abrir o detalhe ao clicar no botão
    if (this.repetindoId !== null) return;
    this.repetindoId = pedido.id;
    this.aviso = '';
    this.erro = '';
    this.deliveryService.repetirPedido(pedido).subscribe({
      next: ({ adicionados, indisponiveis }) => {
        this.repetindoId = null;
        if (adicionados === 0) {
          this.erro = 'Os itens deste pedido não estão mais disponíveis.';
          return;
        }
        if (indisponiveis > 0) {
          this.aviso = `${indisponiveis} item(ns) fora do cardápio não foram adicionados.`;
        }
        this.router.navigate(['/delivery/sacola']);
      },
      error: (err: ApiError) => {
        this.repetindoId = null;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível repetir o pedido.';
      },
    });
  }

  fmt(valor?: string): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  voltar() {
    history.back();
  }
}
