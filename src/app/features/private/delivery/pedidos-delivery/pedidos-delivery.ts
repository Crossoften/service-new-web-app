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

  fmt(valor?: string): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  voltar() {
    history.back();
  }
}
