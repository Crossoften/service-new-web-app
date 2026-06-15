import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DeliveryService, Restaurante, CategoriaCardapio, ItemCardapio } from '../../../../core/services/delivery';

@Component({
  selector: 'app-restaurante',
  imports: [CommonModule],
  templateUrl: './restaurante.html',
  styleUrl: './restaurante.scss'
})
export class RestauranteComponent implements OnInit {
  restaurante?: Restaurante;
  categoriaAtiva: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.restaurante = this.deliveryService.getRestaurante(id);
    if (this.restaurante?.categorias.length) {
      this.categoriaAtiva = this.restaurante.categorias[0].id;
    }
  }

  get categoriaAtivaItens(): ItemCardapio[] {
    return this.restaurante?.categorias
      .find(c => c.id === this.categoriaAtiva)?.itens ?? [];
  }

  selecionarCategoria(id: number) {
    this.categoriaAtiva = id;
  }

  abrirItem(item: ItemCardapio) {
    this.router.navigate(['/delivery/item', item.id], {
      queryParams: { restauranteId: this.restaurante?.id }
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