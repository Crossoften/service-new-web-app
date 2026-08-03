import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, Restaurante } from '../../../../core/services/delivery';
import { HeaderBuscaComponent } from '../../../../shared/components/header-busca/header-busca';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-listagem-delivery',
  imports: [CommonModule, FormsModule, HeaderBuscaComponent],
  templateUrl: './listagem-delivery.html',
  styleUrl: './listagem-delivery.scss',
})
export class ListagemDeliveryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  categoryId: number | null = null;
  restaurantes: Restaurante[] = [];
  busca = '';
  carregando = false;
  erro = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('categoria'));
    this.categoryId = Number.isFinite(id) && id > 0 ? id : null;
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.deliveryService.getRestaurantes(this.categoryId ?? undefined).subscribe({
      next: (lista) => {
        this.carregando = false;
        this.restaurantes = lista;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os restaurantes.';
      },
    });
  }

  get restaurantesFiltrados(): Restaurante[] {
    if (!this.busca.trim()) return this.restaurantes;
    return this.restaurantes.filter((r) => r.nome.toLowerCase().includes(this.busca.toLowerCase()));
  }

  onBuscar(valor: string) {
    this.busca = valor;
  }

  abrirRestaurante(restaurante: Restaurante) {
    this.deliveryService.setPedidoRestaurante(restaurante);
    this.router.navigate(['/delivery/restaurante', restaurante.id]);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
