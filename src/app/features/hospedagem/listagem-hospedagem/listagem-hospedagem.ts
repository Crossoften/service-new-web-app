import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AccommodationService } from '../../../core/services/accommodation';
import { AccommodationListItemDto } from '../../../core/models/accommodation';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-listagem-hospedagem',
  imports: [CommonModule, FormsModule],
  templateUrl: './listagem-hospedagem.html',
  styleUrl: './listagem-hospedagem.scss',
})
export class ListagemHospedagemComponent implements OnInit {
  private readonly accommodation = inject(AccommodationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  itens: AccommodationListItemDto[] = [];
  categoryId?: number;
  categoriaNome = '';
  busca = '';
  carregando = false;
  erro = '';

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('categoryId');
    this.categoryId = id ? Number(id) : undefined;
    this.categoriaNome = this.route.snapshot.queryParamMap.get('categoria') ?? '';
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.accommodation
      .acomodacoes({ categoryId: this.categoryId, search: this.busca.trim() || undefined })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.itens = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as hospedagens.';
        },
      });
  }

  buscar() {
    this.carregar();
  }

  abrir(id: number) {
    this.router.navigate(['/hospedagem/acomodacao', id]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.accommodation.formatarPreco(valor);
  }
}
