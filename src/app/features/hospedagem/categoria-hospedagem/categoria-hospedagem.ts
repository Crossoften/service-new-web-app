import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import {
  CategoriaGridComponent,
  CategoriaItem,
} from '../../../shared/components/categoria-grid/categoria-grid';
import { AccommodationService } from '../../../core/services/accommodation';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-categoria-hospedagem',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-hospedagem.html',
  styleUrl: './categoria-hospedagem.scss',
})
export class CategoriaHospedagemComponent implements OnInit {
  private readonly accommodation = inject(AccommodationService);
  private readonly router = inject(Router);

  items: CategoriaItem[] = [];
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.accommodation
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

  abrirCategoria(item: CategoriaItem) {
    this.router.navigate(['/hospedagem/lista'], {
      queryParams: item.id ? { categoryId: item.id, categoria: item.label } : {},
    });
  }
}
