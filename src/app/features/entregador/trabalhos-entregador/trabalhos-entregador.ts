import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EntregadorService, AtividadeEntregador } from '../../../core/services/entregador';
import { BottomNavEntregadorComponent } from '../../../shared/components/bottom-nav-entregador/bottom-nav-entregador';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-trabalhos-entregador',
  imports: [CommonModule, FormsModule, BottomNavEntregadorComponent],
  templateUrl: './trabalhos-entregador.html',
  styleUrl: './trabalhos-entregador.scss',
})
export class TrabalhosEntregadorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly entregadorService = inject(EntregadorService);

  atividades: AtividadeEntregador[] = [];
  busca = '';
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.entregadorService
      .atividadesRecentes()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => (this.atividades = lista),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as entregas.';
        },
      });
  }

  get atividadesFiltradas(): AtividadeEntregador[] {
    if (!this.busca.trim()) return this.atividades;
    return this.atividades.filter(
      (a) =>
        a.restaurante.toLowerCase().includes(this.busca.toLowerCase()) ||
        a.numero.includes(this.busca),
    );
  }

  formatarPreco(valor: number): string {
    return this.entregadorService.formatarPreco(valor);
  }

  voltar() {
    history.back();
  }
}
