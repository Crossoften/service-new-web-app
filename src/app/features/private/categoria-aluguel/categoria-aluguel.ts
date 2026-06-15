import { Component } from '@angular/core';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';

@Component({
  selector: 'app-categoria-aluguel',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-aluguel.html',
  styleUrl: './categoria-aluguel.scss'
})
export class CategoriaAluguelComponent {

  items: CategoriaItem[] = [
    { label: 'Casa',        icon: 'assets/categorias/aluguel/casa.png' },
    { label: 'Salão de Festa',        icon: 'assets/categorias/aluguel/salao-de-festa.png' },
    { label: 'Ponto Comercial',            icon: 'assets/categorias/aluguel/ponto-comercial.png' },
    { label: 'Caminhão', icon: 'assets/categorias/aluguel/caminhao.png' },
    { label: 'Pasto',               icon: 'assets/categorias/aluguel/pasto.png' },
    { label: 'Betoneira',       icon: 'assets/categorias/aluguel/betoneira.png' },
    { label: 'Carro',            icon: 'assets/categorias/aluguel/carro.png' },
    { label: 'Moto',             icon: 'assets/categorias/aluguel/moto.png' },
    { label: 'Britadeira',              icon: 'assets/categorias/aluguel/britadeira.png' },
  ];
}