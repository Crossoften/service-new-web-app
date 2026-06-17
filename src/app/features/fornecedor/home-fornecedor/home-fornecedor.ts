import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FornecedorService, PedidoFornecedor, FaturamentoFornecedor, StatusPedidoFornecedor } from '../../../core/services/fornecedor';
import { BottomNavFornecedorComponent } from '../../../shared/components/bottom-nav-fornecedor/bottom-nav-fornecedor';

@Component({
  selector: 'app-home-fornecedor',
  imports: [CommonModule, BottomNavFornecedorComponent],
  templateUrl: './home-fornecedor.html',
  styleUrl: './home-fornecedor.scss'
})
export class HomeFornecedorComponent implements OnInit {
  faturamento?: FaturamentoFornecedor;
  pedidos: PedidoFornecedor[] = [];
  statusOperacional: 'aberto' | 'fechado' = 'aberto';

  constructor(
    public router: Router,
    private fornecedorService: FornecedorService
  ) {}

  ngOnInit() {
    this.faturamento = this.fornecedorService.getFaturamento();
    this.pedidos = this.fornecedorService.getPedidos();
  }

  toggleStatus() {
    this.statusOperacional = this.statusOperacional === 'aberto' ? 'fechado' : 'aberto';
  }

  abrirPedido(pedido: PedidoFornecedor) {
    this.router.navigate(['/fornecedor/pedido', pedido.id]);
  }

  statusLabel(status: StatusPedidoFornecedor): string {
    const labels: Record<StatusPedidoFornecedor, string> = {
      recebido:  'Recebido',
      preparo:   'Em preparo',
      caminho:   'A caminho',
      entregue:  'Entregue',
      cancelado: 'Cancelado',
    };
    return labels[status];
  }

  statusClass(status: StatusPedidoFornecedor): string {
    const classes: Record<StatusPedidoFornecedor, string> = {
      recebido:  'status--azul',
      preparo:   'status--laranja',
      caminho:   'status--roxo',
      entregue:  'status--verde',
      cancelado: 'status--vermelho',
    };
    return classes[status];
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}