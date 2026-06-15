import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';

@Component({
  selector: 'app-categoria-delivery',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-delivery.html',
  styleUrl: './categoria-delivery.scss'
})
export class CategoriaDeliveryComponent {

  items: CategoriaItem[] = [
    { label: 'Lanches',        icon: 'assets/categorias/delivery/lanches.png' },
    { label: 'Pizzas',         icon: 'assets/categorias/delivery/pizzas.png' },
    { label: 'Japonesa',       icon: 'assets/categorias/delivery/japonesa.png' },
    { label: 'Chinesa',        icon: 'assets/categorias/delivery/chinesa.png' },
    { label: 'Brasileira',     icon: 'assets/categorias/delivery/brasileira.png' },
    { label: 'Marmitas',       icon: 'assets/categorias/delivery/marmitas.png' },
    { label: 'Saudável / Fit', icon: 'assets/categorias/delivery/saudavel.png' },
    { label: 'Vegetariana',    icon: 'assets/categorias/delivery/vegetariana.png' },
    { label: 'Massas',         icon: 'assets/categorias/delivery/massas.png' },
    { label: 'Sobremesas',     icon: 'assets/categorias/delivery/sobremesas.png' },
    { label: 'Cafeterias',     icon: 'assets/categorias/delivery/cafeterias.png' },
    { label: 'Padarias',       icon: 'assets/categorias/delivery/padarias.png' },
    { label: 'Churrasco',      icon: 'assets/categorias/delivery/churrasco.png' },
    { label: 'Frutos do Mar',  icon: 'assets/categorias/delivery/frutos-do-mar.png' },
    { label: 'Mexicana',       icon: 'assets/categorias/delivery/mexicana.png' },
    { label: 'Árabe',          icon: 'assets/categorias/delivery/arabe.png' },
    { label: 'Doces e Bolos',  icon: 'assets/categorias/delivery/doces-e-bolos.png' },
    { label: 'Bebida e Suco',  icon: 'assets/categorias/delivery/bebida-e-suco.png' },
  ];

  constructor(private router: Router) {}

  onItemSelecionado(item: CategoriaItem) {
    this.router.navigate(['/delivery/listagem', item.label.toLowerCase()]);
  }
}