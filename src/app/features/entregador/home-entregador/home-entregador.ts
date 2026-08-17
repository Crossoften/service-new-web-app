import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {
  EntregadorService,
  PedidoEntregador,
  AtividadeEntregador,
} from '../../../core/services/entregador';
import { BottomNavEntregadorComponent } from '../../../shared/components/bottom-nav-entregador/bottom-nav-entregador';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-home-entregador',
  imports: [CommonModule, BottomNavEntregadorComponent],
  templateUrl: './home-entregador.html',
  styleUrl: './home-entregador.scss',
})
export class HomeEntregadorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly entregadorService = inject(EntregadorService);

  disponiveis: PedidoEntregador[] = [];
  atividades: AtividadeEntregador[] = [];
  statusOperacional: 'ativo' | 'inativo' = 'ativo';
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.entregadorService
      .entregasDisponiveis()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => (this.disponiveis = lista),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as entregas.';
        },
      });
    this.entregadorService.atividadesRecentes().subscribe({
      next: (lista) => (this.atividades = lista.slice(0, 3)),
      error: () => {},
    });
  }

  abrirEntrega(id: number) {
    this.router.navigate(['/entregador/entrega', id]);
  }

  aceitar(pedido: PedidoEntregador) {
    this.erro = '';
    this.entregadorService.aceitar(pedido.id).subscribe({
      next: () => this.router.navigate(['/entregador/entrega', pedido.id]),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível aceitar a entrega.';
      },
    });
  }

  /** Disponível não tem endpoint de recusa — apenas remove da lista localmente. */
  recusar(pedido: PedidoEntregador) {
    this.disponiveis = this.disponiveis.filter((p) => p.id !== pedido.id);
  }

  formatarPreco(valor: number): string {
    return this.entregadorService.formatarPreco(valor);
  }
}
