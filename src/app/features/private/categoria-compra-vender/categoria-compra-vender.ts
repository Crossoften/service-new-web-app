import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import {
  CategoriaGridComponent,
  CategoriaItem,
} from '../../../shared/components/categoria-grid/categoria-grid';
import { MarketplaceService } from '../../../core/services/marketplace';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-categoria-compra-vender',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-compra-vender.html',
  styleUrl: './categoria-compra-vender.scss',
})
export class CategoriaCompraVenderComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly router = inject(Router);

  items: CategoriaItem[] = [];
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.marketplace
      .categorias()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (categorias) => {
          this.items = categorias.map((c) => ({
            id: c.id,
            label: c.name,
            icon: c.iconUrl ?? '',
          }));
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim()
            ? err.message
            : 'Não foi possível carregar as categorias.';
        },
      });
  }

  abrirCategoria(item: CategoriaItem) {
    this.router.navigate(['/compra-vender/produtos'], {
      queryParams: item.id ? { categoryId: item.id, categoria: item.label } : {},
    });
  }
}
