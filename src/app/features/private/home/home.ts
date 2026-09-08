import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { ProfileService } from '../../../core/services/profile';
import { DeliveryService } from '../../../core/services/delivery';
import { FoodOrderStatus, ResponseFoodOrderDto } from '../../../core/models/food-order';

/** Status de pedido ainda "em andamento" (não entregue nem cancelado). */
const STATUS_ATIVOS: FoodOrderStatus[] = ['Received', 'Accepted', 'Preparing', 'OnTheWay'];

const STATUS_LABEL: Record<FoodOrderStatus, string> = {
  Received: 'Pedido recebido',
  Accepted: 'Confirmado',
  Preparing: 'Em preparo',
  OnTheWay: 'A caminho',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profile = inject(ProfileService);
  private readonly delivery = inject(DeliveryService);
  private readonly router = inject(Router);

  devMenuAberto = false;

  // Identidade real do cliente (sem mock)
  nome = '';
  inicial = 'U';

  // Pedidos em andamento (para o destaque na home)
  pedidosAtivos: ResponseFoodOrderDto[] = [];

  servicos = [
    { label: 'DELIVERY',                rota: '/delivery' },
    { label: 'SERVIÇOS',                rota: '/servicos' },
    { label: 'COMPRA E VENDER',         rota: '/compra-vender' },
    { label: 'ALUGUEL',                 rota: '/aluguel' },
    { label: 'TRANSPORTE',              rota: '/transporte' },
    { label: 'HOSPEDAGEM',              rota: '/hospedagem' },
    { label: 'EMPREGOS E EMPREGADORES', rota: '/empregos/vagas' },
    { label: 'ANUNCIE AQUI',            rota: null },
  ];

  ngOnInit() {
    this.profile.me().subscribe({
      next: (p) => {
        this.nome = p.name ?? '';
        this.inicial = (this.nome.trim()[0] ?? 'U').toUpperCase();
      },
      error: () => {},
    });
    this.delivery.getMeusPedidos().subscribe({
      next: (lista) => (this.pedidosAtivos = (lista ?? []).filter((p) => STATUS_ATIVOS.includes(p.status))),
      error: () => {},
    });
  }

  get nomeExibicao(): string {
    return this.nome.trim() || 'Usuário';
  }

  get pedidoAtivo(): ResponseFoodOrderDto | undefined {
    return this.pedidosAtivos[0];
  }

  statusLabel(status: FoodOrderStatus): string {
    return STATUS_LABEL[status] ?? status;
  }

  /** Abre a listagem dos pedidos do cliente (todos, incluindo os em andamento). */
  verPedidos() {
    this.router.navigate(['/delivery/pedidos']);
  }

  toggleDevMenu() {
    this.devMenuAberto = !this.devMenuAberto;
  }

  navegar(rota: string | null) {
    if (rota) {
      this.devMenuAberto = false;
      this.router.navigate([rota]);
    }
  }

  /** Encerra a sessão e volta ao login (permite trocar de conta/perfil). */
  sair() {
    this.devMenuAberto = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
