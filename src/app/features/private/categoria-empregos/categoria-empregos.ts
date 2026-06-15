import { Component } from '@angular/core';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';

@Component({
  selector: 'app-categoria-empregos',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-empregos.html',
  styleUrl: './categoria-empregos.scss'
})
export class CategoriaEmpregosComponent {

  items: CategoriaItem[] = [
    { label: 'Frentista',           icon: 'assets/categorias/empregos/frentista.png' },
    { label: 'Cozinheiro',          icon: 'assets/categorias/empregos/cozinheiro.png' },
    { label: 'Empregada doméstica', icon: 'assets/categorias/empregos/empregada-domestica.png' },
    { label: 'Secretária',          icon: 'assets/categorias/empregos/secretaria.png' },
    { label: 'Motorista',           icon: 'assets/categorias/empregos/motorista.png' },
    { label: 'RH',                  icon: 'assets/categorias/empregos/rh.png' },
    { label: 'Financeiro',          icon: 'assets/categorias/empregos/financeiro.png' },
    { label: 'Atendente',           icon: 'assets/categorias/empregos/atendente.png' },
    { label: 'Vendedor',            icon: 'assets/categorias/empregos/vendedor.png' },
  ];
}