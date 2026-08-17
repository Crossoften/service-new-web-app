import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoriaItem {
  label: string;
  icon: string;
  /** Id da categoria na API, quando a origem for o back-end (opcional). */
  id?: number;
}

@Component({
  selector: 'app-categoria-grid',
  imports: [CommonModule],
  templateUrl: './categoria-grid.html',
  styleUrl: './categoria-grid.scss'
})
export class CategoriaGridComponent {
  @Input() items: CategoriaItem[] = [];
  @Input() tipo: string = '';
  @Output() itemSelecionado = new EventEmitter<CategoriaItem>();

  selecionar(item: CategoriaItem) {
    this.itemSelecionado.emit(item);
  }
}