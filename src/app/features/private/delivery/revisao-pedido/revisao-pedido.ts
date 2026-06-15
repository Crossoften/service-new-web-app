import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, Pedido } from '../../../../core/services/delivery';

@Component({
  selector: 'app-revisao-pedido',
  imports: [CommonModule],
  templateUrl: './revisao-pedido.html',
  styleUrl: './revisao-pedido.scss'
})
export class RevisaoPedidoComponent implements OnInit {
  pedido?: Partial<Pedido>;

  constructor(
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    this.pedido = this.deliveryService.getPedidoAtual();
  }

  get formaPagamentoLabel(): string {
    const formas: Record<string, string> = {
      credito: 'Cartão de Crédito',
      debito: 'Cartão de Débito',
      pix: 'PIX',
      dinheiro: 'Dinheiro na entrega'
    };
    return formas[this.pedido?.formaPagamento ?? ''] ?? 'Cartão de Crédito';
  }

  finalizarPedido() {
    const pedido = this.deliveryService.finalizarPedido();
    this.router.navigate(['/delivery/status', pedido.id]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get total(): number {
    return this.deliveryService.calcularTotal();
  }
}