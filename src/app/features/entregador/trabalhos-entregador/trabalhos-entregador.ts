import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EntregadorService, AtividadeEntregador } from '../../../core/services/entregador';
import { ProfileService } from '../../../core/services/profile';
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
  private readonly profile = inject(ProfileService);

  atividades: AtividadeEntregador[] = [];
  busca = '';
  carregando = false;
  erro = '';

  // Identidade real do entregador (antes era placeholder fixo no header).
  nome = '';
  fotoUrl?: string;

  ngOnInit() {
    this.carregarPerfil();
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

  /** Nome + foto reais do entregador para o header (GET /profile/me). */
  carregarPerfil() {
    this.profile.me().subscribe({
      next: (p) => {
        this.nome = p.name ?? '';
        this.fotoUrl = p.fileUrl;
      },
      error: () => {},
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
