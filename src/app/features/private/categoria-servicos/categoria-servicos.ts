import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderBuscaComponent } from '../../../shared/components/header-busca/header-busca';
import { CategoriaGridComponent, CategoriaItem } from '../../../shared/components/categoria-grid/categoria-grid';

@Component({
  selector: 'app-categoria-servicos',
  imports: [HeaderBuscaComponent, CategoriaGridComponent],
  templateUrl: './categoria-servicos.html',
  styleUrl: './categoria-servicos.scss'
})
export class CategoriaServicosComponent {

  items: CategoriaItem[] = [
    { label: 'Pintor',       icon: 'assets/categorias/servicos/pintor.png' },
    { label: 'Pedreiro',     icon: 'assets/categorias/servicos/pedreiro.png' },
    { label: 'Advogado',     icon: 'assets/categorias/servicos/advogado.png' },
    { label: 'Dentista',     icon: 'assets/categorias/servicos/dentista.png' },
    { label: 'Médico',       icon: 'assets/categorias/servicos/medico.png' },
    { label: 'Manicure',     icon: 'assets/categorias/servicos/manicure.png' },
    { label: 'Jardineiro',   icon: 'assets/categorias/servicos/jardineiro.png' },
    { label: 'Cabelereiro',  icon: 'assets/categorias/servicos/cabelereiro.png' },
    { label: 'Faxineira',    icon: 'assets/categorias/servicos/faxineira.png' },
  ];

  constructor(private router: Router) {}

  onItemSelecionado(item: CategoriaItem) {
    this.router.navigate(['/servicos/listagem', item.label.toLowerCase()]);
  }
}