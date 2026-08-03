import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';
import { DeliveryService } from '../../../core/services/delivery';
import { ResponseRestaurantCategoryDto } from '../../../core/models/restaurant';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-categoria-delivery',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-delivery.html',
  styleUrl: './categoria-delivery.scss',
})
export class CategoriaDeliveryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  categorias: ResponseRestaurantCategoryDto[] = [];
  items: CategoriaItem[] = [];
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.deliveryService.getCategorias().subscribe({
      next: (cats) => {
        this.carregando = false;
        this.categorias = cats ?? [];
        this.items = this.categorias.map((c) => ({ label: c.name, icon: c.iconUrl ?? '' }));
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as categorias.';
      },
    });
  }

  onItemSelecionado(item: CategoriaItem) {
    const cat = this.categorias.find((c) => c.name === item.label);
    if (cat) {
      this.router.navigate(['/delivery/listagem', cat.id]);
    }
  }
}
