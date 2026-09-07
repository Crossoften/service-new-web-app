import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, Pedido } from '../../../../core/services/delivery';
import { ApiError } from '../../../../core/models/common';

/** Identifica o 400 de "restaurante ainda não vinculou o Mercado Pago". */
function restauranteSemMercadoPago(err: ApiError): boolean {
  return err?.status === 400 && /mercado\s*pago|vinculou/i.test(err?.message ?? '');
}

@Component({
  selector: 'app-revisao-pedido',
  imports: [CommonModule],
  templateUrl: './revisao-pedido.html',
  styleUrl: './revisao-pedido.scss',
})
export class RevisaoPedidoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  pedido?: Partial<Pedido>;
  enviando = false;
  erro = '';
  /** Restaurante não aceita pagamento online → oferecer finalizar em dinheiro. */
  sugerirDinheiro = false;

  ngOnInit() {
    this.pedido = this.deliveryService.getPedidoAtual();
  }

  get formaPagamentoLabel(): string {
    const labels: Record<string, string> = {
      credito: 'Cartão de Crédito',
      debito: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      dinheiro: 'Dinheiro',
    };
    return labels[this.pedido?.formaPagamento ?? 'credito'] ?? 'Cartão de Crédito';
  }

  finalizarPedido() {
    if (this.enviando) return;
    if (!this.pedido?.restaurante || !this.pedido?.itens?.length) {
      this.erro = 'Sua sacola está vazia.';
      return;
    }
    this.erro = '';
    this.sugerirDinheiro = false;
    this.enviando = true;
    this.deliveryService.criarPedido().subscribe({
      next: (res) => {
        this.enviando = false;
        this.router.navigate(['/delivery/status', res.foodOrder.id]);
      },
      error: (err: ApiError) => {
        this.enviando = false;
        if (restauranteSemMercadoPago(err) && this.pedido?.formaPagamento !== 'dinheiro') {
          // O restaurante ainda não aceita pagamento online. Ofereça a saída em dinheiro.
          this.sugerirDinheiro = true;
          this.erro = 'Este restaurante ainda não aceita pagamento online. Você pode finalizar pagando em dinheiro na entrega.';
        } else {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível finalizar o pedido.';
        }
      },
    });
  }

  /** Troca a forma para dinheiro e refaz o pedido — saída para o restaurante sem Mercado Pago. */
  pagarEmDinheiro() {
    this.deliveryService.setFormaPagamento('dinheiro');
    this.sugerirDinheiro = false;
    this.erro = '';
    this.finalizarPedido();
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
