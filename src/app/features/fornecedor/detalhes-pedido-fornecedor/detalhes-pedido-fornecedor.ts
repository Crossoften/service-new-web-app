import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FornecedorService } from '../../../core/services/fornecedor';
import { FoodOrderStatus, PAYMENT_METHOD_LABEL, ResponseFoodOrderDto } from '../../../core/models/food-order';
import { ApiError } from '../../../core/models/common';

const STATUS_LABEL: Record<FoodOrderStatus, string> = {
  Received: 'Recebido',
  Accepted: 'Aceito',
  Preparing: 'Em preparo',
  OnTheWay: 'A caminho',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

@Component({
  selector: 'app-detalhes-pedido-fornecedor',
  imports: [CommonModule],
  templateUrl: './detalhes-pedido-fornecedor.html',
  styleUrl: './detalhes-pedido-fornecedor.scss',
})
export class DetalhesPedidoFornecedorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fornecedorService = inject(FornecedorService);

  pedidoId = 0;
  pedido?: ResponseFoodOrderDto;
  carregando = false;
  processando = false;
  erro = '';

  ngOnInit() {
    this.pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.fornecedorService.getPedidoRecebido(this.pedidoId).subscribe({
      next: (p) => {
        this.carregando = false;
        this.pedido = p;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o pedido.';
      },
    });
  }

  get statusLabel(): string {
    return this.pedido ? STATUS_LABEL[this.pedido.status] : '';
  }

  get podeResponder(): boolean {
    return this.pedido?.status === 'Received';
  }

  get podePreparar(): boolean {
    return this.pedido?.status === 'Accepted';
  }

  /** Confirmação de pagamento só para dinheiro ainda pendente. */
  get podeConfirmarPagamento(): boolean {
    return this.pedido?.paymentMethod === 'Cash' && this.pedido?.paymentStatus === 'Pending';
  }

  get formaPagamentoLabel(): string {
    return this.pedido ? PAYMENT_METHOD_LABEL[this.pedido.paymentMethod] : '';
  }

  confirmarPagamento() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.fornecedorService.confirmarPagamento(this.pedidoId).subscribe({
      next: (p) => {
        this.processando = false;
        this.pedido = p;
      },
      error: (err: ApiError) => this.falhar(err),
    });
  }

  aceitar() {
    this.responder('Accepted');
  }

  recusar() {
    this.responder('Cancelled');
  }

  private responder(status: 'Accepted' | 'Cancelled') {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.fornecedorService.responderPedido(this.pedidoId, status).subscribe({
      next: (p) => {
        this.processando = false;
        this.pedido = p;
      },
      error: (err: ApiError) => this.falhar(err),
    });
  }

  emPreparo() {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    this.fornecedorService.marcarPreparo(this.pedidoId).subscribe({
      next: (p) => {
        this.processando = false;
        this.pedido = p;
      },
      error: (err: ApiError) => this.falhar(err),
    });
  }

  private falhar(err: ApiError) {
    this.processando = false;
    this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar o pedido.';
  }

  fmt(valor?: string): string {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  abrirChat() {
    if (this.pedido) this.router.navigate(['/chat', this.pedido.chatRoomId]);
  }

  voltar() {
    history.back();
  }
}
