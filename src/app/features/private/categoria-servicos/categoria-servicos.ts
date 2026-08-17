import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import {
  CategoriaGridComponent,
  CategoriaItem,
} from '../../../shared/components/categoria-grid/categoria-grid';
import { ServiceCatalogService } from '../../../core/services/service-catalog';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-categoria-servicos',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-servicos.html',
  styleUrl: './categoria-servicos.scss',
})
export class CategoriaServicosComponent implements OnInit {
  private readonly catalog = inject(ServiceCatalogService);
  private readonly router = inject(Router);

  items: CategoriaItem[] = [];
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.catalog
      .categorias()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (cats) => {
          this.items = cats.map((c) => ({ id: c.id, label: c.name, icon: c.iconUrl ?? '' }));
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim()
            ? err.message
            : 'Não foi possível carregar as categorias.';
        },
      });
  }

  onItemSelecionado(item: CategoriaItem) {
    if (!item.id) return;
    this.router.navigate(['/servicos/listagem', item.id], { queryParams: { nome: item.label } });
  }
}
