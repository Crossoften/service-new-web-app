import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, Pedido, FormaPagamento } from '../../../../core/services/delivery';

@Component({
  selector: 'app-sacola',
  imports: [CommonModule],
  templateUrl: './sacola.html',
  styleUrl: './sacola.scss'
})
export class SacolaComponent implements OnInit {
  pedido?: Partial<Pedido>;
  formaPagamentoAberta: boolean = false;
  formaSelecionada: FormaPagamento = 'credito';

  formasPagamento: { id: FormaPagamento; label: string; icone: string }[] = [
    { id: 'credito', label: 'Cartão de Crédito', icone: 'card' },
    { id: 'pix',     label: 'PIX',               icone: 'pix' },
  ];

  constructor(
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    this.pedido = this.deliveryService.getPedidoAtual();
  }

  get formaSelecionadaLabel(): string {
    return this.formasPagamento.find(f => f.id === this.formaSelecionada)?.label ?? '';
  }

  togglePagamento() {
    this.formaPagamentoAberta = !this.formaPagamentoAberta;
  }

  selecionarForma(forma: FormaPagamento) {
    this.formaSelecionada = forma;
    this.deliveryService.setFormaPagamento(forma);
    this.formaPagamentoAberta = false;
  }

  continuar() {
    this.deliveryService.setFormaPagamento(this.formaSelecionada);
    this.router.navigate(['/delivery/endereco']);
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