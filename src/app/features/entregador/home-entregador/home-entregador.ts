import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EntregadorService, FaturamentoEntregador, PedidoEntregador, AtividadeEntregador } from '../../../core/services/entregador';
import { BottomNavEntregadorComponent } from '../../../shared/components/bottom-nav-entregador/bottom-nav-entregador';

@Component({
  selector: 'app-home-entregador',
  imports: [CommonModule, BottomNavEntregadorComponent],
  templateUrl: './home-entregador.html',
  styleUrl: './home-entregador.scss'
})
export class HomeEntregadorComponent implements OnInit {
  faturamento?: FaturamentoEntregador;
  pedidoPendente: PedidoEntregador | null = null;
  atividades: AtividadeEntregador[] = [];
  statusOperacional: 'ativo' | 'inativo' = 'ativo';

  constructor(
    public router: Router,
    private entregadorService: EntregadorService
  ) {}

  ngOnInit() {
    this.faturamento = this.entregadorService.getFaturamento();
    this.pedidoPendente = this.entregadorService.getPedidoPendente();
    this.atividades = this.entregadorService.getAtividades().slice(0, 3);
  }
  
  abrirEntrega(id: number) {
  this.router.navigate(['/entregador/entrega', id]);
}

  aceitarPedido() {
    const pedido = this.entregadorService.aceitarPedido();
    this.pedidoPendente = null;
    this.router.navigate(['/entregador/entrega', pedido.id]);
  }

  recusarPedido() {
    this.entregadorService.recusarPedido();
    this.pedidoPendente = null;
  }

  formatarPreco(valor: number): string {
    return this.entregadorService.formatarPreco(valor);
  }
}