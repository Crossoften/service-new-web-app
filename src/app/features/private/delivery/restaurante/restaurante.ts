import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, Restaurante, ItemCardapio } from '../../../../core/services/delivery';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-restaurante',
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurante.html',
  styleUrl: './restaurante.scss',
})
export class RestauranteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  restaurante?: Restaurante;
  categoriaAtiva = 0;
  carregando = false;
  erro = '';

  // Avaliação
  mostrarAvaliacao = false;
  nota = 5;
  comentario = '';
  jaAvaliou = false;
  enviandoAvaliacao = false;
  avaliacaoErro = '';
  avaliacaoMsg = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.deliveryService.getRestaurante(id).subscribe({
      next: (r) => {
        this.carregando = false;
        this.restaurante = r;
        if (r.categorias.length) {
          this.categoriaAtiva = r.categorias[0].id;
        }
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o restaurante.';
      },
    });
  }

  get categoriaAtivaItens(): ItemCardapio[] {
    return this.restaurante?.categorias.find((c) => c.id === this.categoriaAtiva)?.itens ?? [];
  }

  selecionarCategoria(id: number) {
    this.categoriaAtiva = id;
  }

  abrirItem(item: ItemCardapio) {
    this.router.navigate(['/delivery/item', item.id], {
      queryParams: { restauranteId: this.restaurante?.id },
    });
  }

  abrirSacola() {
    this.router.navigate(['/delivery/sacola']);
  }

  // ── Avaliação ──────────────────────────────────────────────────────────────

  abrirAvaliacao() {
    this.avaliacaoErro = '';
    this.avaliacaoMsg = '';
    this.mostrarAvaliacao = true;
  }

  fecharAvaliacao() {
    this.mostrarAvaliacao = false;
  }

  selecionarNota(n: number) {
    this.nota = n;
  }

  enviarAvaliacao() {
    if (this.enviandoAvaliacao || !this.restaurante) return;
    if (this.nota < 1 || this.nota > 5) {
      this.avaliacaoErro = 'Escolha uma nota de 1 a 5.';
      return;
    }
    this.enviandoAvaliacao = true;
    this.avaliacaoErro = '';
    const comment = this.comentario.trim();
    this.deliveryService
      .avaliarRestaurante(this.restaurante.id, { rating: this.nota, comment: comment || undefined })
      .subscribe({
        next: () => {
          this.enviandoAvaliacao = false;
          this.mostrarAvaliacao = false;
          this.jaAvaliou = true;
          this.avaliacaoMsg = 'Obrigado pela sua avaliação!';
        },
        error: (err: ApiError) => {
          this.enviandoAvaliacao = false;
          if (err?.status === 409) {
            // Já avaliou — esconde a ação.
            this.jaAvaliou = true;
            this.mostrarAvaliacao = false;
            this.avaliacaoMsg = 'Você já avaliou este restaurante.';
            return;
          }
          if (err?.status === 403) {
            this.avaliacaoErro = 'Só é possível avaliar após receber um pedido deste restaurante.';
            return;
          }
          this.avaliacaoErro = err?.message?.trim() ? err.message : 'Não foi possível enviar a avaliação.';
        },
      });
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
