import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {
  EntregadorService,
  PedidoEntregador,
  AtividadeEntregador,
  GanhosEntregador,
} from '../../../core/services/entregador';
import { BottomNavEntregadorComponent } from '../../../shared/components/bottom-nav-entregador/bottom-nav-entregador';
import { ProfileService } from '../../../core/services/profile';
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
  private readonly profile = inject(ProfileService);

  disponiveis: PedidoEntregador[] = [];
  atividades: AtividadeEntregador[] = [];
  ganhos?: GanhosEntregador;
  /** Disponibilidade operacional (BE-COURIER-AVAILABILITY-1) — lida do perfil. */
  disponivel = true;
  salvandoDisponibilidade = false;
  carregando = false;
  erro = '';

  // Identidade real do entregador (antes era placeholder fixo no header).
  nome = '';
  fotoUrl?: string;

  ngOnInit() {
    this.carregarPerfil();
    this.carregar();
    this.carregarGanhos();
  }

  /** Nome + foto + disponibilidade reais do entregador (GET /profile/me). */
  carregarPerfil() {
    this.profile.me().subscribe({
      next: (p) => {
        this.nome = p.name ?? '';
        this.fotoUrl = p.fileUrl;
        // `isAvailable` vem só no perfil de entregador; ausente → assume disponível.
        this.disponivel = p.isAvailable ?? true;
      },
      error: () => {},
    });
  }

  /**
   * Alterna a disponibilidade (PATCH /deliveries/me/availability). A resposta já
   * traz o estado resultante — não reconsulta o perfil. Em erro, mantém o estado
   * anterior e mostra a mensagem.
   */
  definirDisponibilidade(valor: boolean) {
    if (this.salvandoDisponibilidade || this.disponivel === valor) return;
    this.salvandoDisponibilidade = true;
    this.erro = '';
    this.entregadorService.definirDisponibilidade(valor).subscribe({
      next: (estado) => {
        this.disponivel = estado;
        this.salvandoDisponibilidade = false;
        // Voltou à operação: recarrega a fila de corridas (vinha vazia quando off).
        if (estado) this.carregar();
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar sua disponibilidade.';
        this.salvandoDisponibilidade = false;
      },
    });
  }

  /** Carteira: `available` (a receber) em destaque; total como histórico (§8.5). */
  carregarGanhos() {
    this.entregadorService.ganhos().subscribe({
      next: (g) => (this.ganhos = g),
      error: () => {},
    });
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
