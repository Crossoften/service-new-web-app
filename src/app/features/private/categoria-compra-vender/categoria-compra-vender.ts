import { Component } from '@angular/core';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';

@Component({
  selector: 'app-categoria-compra-vender',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-compra-vender.html',
  styleUrl: './categoria-compra-vender.scss'
})
export class CategoriaCompraVenderComponent {

  items: CategoriaItem[] = [
    { label: 'Eletrônicos',      icon: 'assets/categorias/compra-vender/eletronicos.png' },
    { label: 'Móveis',           icon: 'assets/categorias/compra-vender/moveis.png' },
    { label: 'Roupas',           icon: 'assets/categorias/compra-vender/roupas.png' },
    { label: 'Calçados',         icon: 'assets/categorias/compra-vender/calcados.png' },
    { label: 'Veículos',         icon: 'assets/categorias/compra-vender/veiculos.png' },
    { label: 'Imóveis',          icon: 'assets/categorias/compra-vender/imoveis.png' },
    { label: 'Esportes',         icon: 'assets/categorias/compra-vender/esportes.png' },
    { label: 'Brinquedos',       icon: 'assets/categorias/compra-vender/brinquedos.png' },
    { label: 'Livros',           icon: 'assets/categorias/compra-vender/livros.png' },
    { label: 'Ferramentas',      icon: 'assets/categorias/compra-vender/ferramentas.png' },
    { label: 'Eletrodomésticos', icon: 'assets/categorias/compra-vender/eletrodomesticos.png' },
   // { label: 'Outros',           icon: 'assets/categorias/compra-vender/outros.png' },
  ];
}