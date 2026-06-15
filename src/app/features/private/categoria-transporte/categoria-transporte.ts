import { Component } from '@angular/core';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';

@Component({
  selector: 'app-categoria-transporte',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-transporte.html',
  styleUrl: './categoria-transporte.scss'
})
export class CategoriaTransporteComponent {

  items: CategoriaItem[] = [
    { label: 'Caminhão de concreto', icon: 'assets/categorias/transporte/caminhao-concreto.png' },
    { label: 'Caminhão pipa',        icon: 'assets/categorias/transporte/caminhao-pipa.png' },
    { label: 'Caçamba',              icon: 'assets/categorias/transporte/cacamba.png' },
    { label: 'Caminhão',             icon: 'assets/categorias/transporte/caminhao.png' },
    { label: 'Caminhão Baú',         icon: 'assets/categorias/transporte/caminhao-bau.png' },
    { label: 'Van',                  icon: 'assets/categorias/transporte/van.png' },
    { label: 'Carro',                icon: 'assets/categorias/transporte/carro.png' },
    { label: 'Moto',                 icon: 'assets/categorias/transporte/moto.png' },
    { label: 'Guincho',              icon: 'assets/categorias/transporte/guincho.png' },
  ];
}