import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {
  FornecedorService,
  PedidoFornecedor,
  StatusPedidoFornecedor,
} from '../../../core/services/fornecedor';
import { BottomNavFornecedorComponent } from '../../../shared/components/bottom-nav-fornecedor/bottom-nav-fornecedor';
import { ResponseRestaurantDto, ResponseRestaurantPayoutDto } from '../../../core/models/restaurant';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-home-fornecedor',
  imports: [CommonModule, BottomNavFornecedorComponent],
  templateUrl: './home-fornecedor.html',
  styleUrl: './home-fornecedor.scss',
})
export class HomeFornecedorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly fornecedorService = inject(FornecedorService);

  restaurante: ResponseRestaurantDto | null = null;
  payout?: ResponseRestaurantPayoutDto;
  pedidos: PedidoFornecedor[] = [];
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.fornecedorService
      .meuRestaurante()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (r) => {
          this.restaurante = r;
          if (r) {
            this.carregarPayout();
            this.carregarPedidos();
          }
        },
        error: () => {},
      });
  }

  irParaRestaurante() {
    this.router.navigate(['/fornecedor/restaurante']);
  }

  get semRestaurante(): boolean {
    return !this.carregando && this.restaurante === null;
  }

  get aberto(): boolean {
    return this.restaurante?.isOpen ?? false;
  }

  private carregarPayout() {
    this.fornecedorService.getPayout().subscribe({ next: (p) => (this.payout = p), error: () => {} });
  }

  private carregarPedidos() {
    this.fornecedorService.getPedidosRecebidos().subscribe({
      next: (lista) => (this.pedidos = lista),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os pedidos.';
      },
    });
  }

  criarRestaurante() {
    this.router.navigate(['/fornecedor/restaurante']);
  }

  setAberto(valor: boolean) {
    if (!this.restaurante || this.restaurante.isOpen === valor) return;
    const id = this.restaurante.id;
    this.fornecedorService.definirAberto(id, valor).subscribe({
      next: (r) => (this.restaurante = r),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar o status.';
      },
    });
  }

  abrirPedido(pedido: PedidoFornecedor) {
    this.router.navigate(['/fornecedor/pedido', pedido.id]);
  }

  statusLabel(status: StatusPedidoFornecedor): string {
    const labels: Record<StatusPedidoFornecedor, string> = {
      recebido: 'Recebido',
      preparo: 'Em preparo',
      caminho: 'A caminho',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return labels[status];
  }

  statusClass(status: StatusPedidoFornecedor): string {
    const classes: Record<StatusPedidoFornecedor, string> = {
      recebido: 'status--azul',
      preparo: 'status--laranja',
      caminho: 'status--roxo',
      entregue: 'status--verde',
      cancelado: 'status--vermelho',
    };
    return classes[status];
  }

  fmt(valor?: string): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
