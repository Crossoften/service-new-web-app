import { Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenacaoItem, ORDENACOES_ITEM } from '../../../core/utils/item-search';

/**
 * Seletor de ordenação reutilizável para as vitrines de itens
 * (produtos, aluguel, transporte, hospedagem). Presentational: o valor é
 * two-way (`[(valor)]`); o pai aplica `ordenarItens(lista, valor)`.
 */
@Component({
  selector: 'app-ordenacao-itens',
  imports: [CommonModule],
  templateUrl: './ordenacao-itens.html',
  styleUrl: './ordenacao-itens.scss',
})
export class OrdenacaoItensComponent {
  valor = model<OrdenacaoItem>('relevancia');
  aberto = false;

  get opcoes() {
    return ORDENACOES_ITEM;
  }

  get label(): string {
    return this.opcoes.find((o) => o.id === this.valor())?.label ?? 'Relevância';
  }

  toggle() {
    this.aberto = !this.aberto;
  }

  selecionar(o: OrdenacaoItem) {
    this.valor.set(o);
    this.aberto = false;
  }
}
