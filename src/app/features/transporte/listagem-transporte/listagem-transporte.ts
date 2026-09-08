import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TransportService } from '../../../core/services/transport';
import { TransportationListItemDto } from '../../../core/models/transportation';
import { ApiError } from '../../../core/models/common';
import { OrdenacaoItensComponent } from '../../../shared/components/ordenacao-itens/ordenacao-itens';
import { OrdenacaoItem, ordenarItens } from '../../../core/utils/item-search';

@Component({
  selector: 'app-listagem-transporte',
  imports: [CommonModule, FormsModule, OrdenacaoItensComponent],
  templateUrl: './listagem-transporte.html',
  styleUrl: './listagem-transporte.scss',
})
export class ListagemTransporteComponent implements OnInit {
  private readonly transport = inject(TransportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  itens: TransportationListItemDto[] = [];
  categoryId?: number;
  categoriaNome = '';
  busca = '';
  ordenacao: OrdenacaoItem = 'relevancia';
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
    this.transport
      .transportes({ categoryId: this.categoryId, search: this.busca.trim() || undefined })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.itens = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os veículos.';
        },
      });
  }

  buscar() {
    this.carregar();
  }

  get itensOrdenados(): TransportationListItemDto[] {
    return ordenarItens(this.itens, this.ordenacao);
  }

  abrir(id: number) {
    this.router.navigate(['/transporte/veiculo', id]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.transport.formatarPreco(valor);
  }
}
