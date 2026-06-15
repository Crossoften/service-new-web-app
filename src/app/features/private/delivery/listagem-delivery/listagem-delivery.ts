import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, Restaurante } from '../../../../core/services/delivery';
import { HeaderBuscaComponent } from '../../../../shared/components/header-busca/header-busca';

@Component({
  selector: 'app-listagem-delivery',
  imports: [CommonModule, FormsModule, HeaderBuscaComponent],
  templateUrl: './listagem-delivery.html',
  styleUrl: './listagem-delivery.scss'
})
export class ListagemDeliveryComponent implements OnInit {
  categoria: string = '';
  restaurantes: Restaurante[] = [];
  busca: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit() {
    this.categoria = this.route.snapshot.paramMap.get('categoria') ?? '';
    this.restaurantes = this.deliveryService.getRestaurantes(this.categoria);
  }

  get restaurantesFiltrados(): Restaurante[] {
    if (!this.busca.trim()) return this.restaurantes;
    return this.restaurantes.filter(r =>
      r.nome.toLowerCase().includes(this.busca.toLowerCase())
    );
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