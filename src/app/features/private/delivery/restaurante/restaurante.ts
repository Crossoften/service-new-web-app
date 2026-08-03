import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, Restaurante, ItemCardapio } from '../../../../core/services/delivery';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-restaurante',
  imports: [CommonModule],
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

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
