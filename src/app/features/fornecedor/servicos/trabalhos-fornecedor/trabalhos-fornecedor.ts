import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WorkService, TrabalhoFornecedor, StatusTrabalho } from '../../../../core/services/work';
import { ApiError } from '../../../../core/models/common';
import { BottomNavFornecedorServicosComponent } from '../../../../shared/components/bottom-nav-fornecedor-servicos/bottom-nav-fornecedor-servicos';

type TabTrabalho = 'em_andamento' | 'finalizadas' | 'canceladas';

@Component({
  selector: 'app-trabalhos-fornecedor',
  imports: [CommonModule, BottomNavFornecedorServicosComponent],
  templateUrl: './trabalhos-fornecedor.html',
  styleUrl: './trabalhos-fornecedor.scss'
})
export class TrabalhosFornecedorComponent implements OnInit {
  private readonly works = inject(WorkService);

  trabalhos: TrabalhoFornecedor[] = [];
  tabAtiva: TabTrabalho = 'em_andamento';
  carregando = false;
  erro = '';

  tabs: { id: TabTrabalho; label: string }[] = [
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'finalizadas',  label: 'Finalizadas' },
    { id: 'canceladas',   label: 'Canceladas' },
  ];

  constructor(public router: Router) {}

  ngOnInit() {
    this.carregando = true;
    this.works.trabalhos().subscribe({
      next: (lista) => {
        this.trabalhos = lista;
        this.carregando = false;
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os trabalhos.';
        this.carregando = false;
      },
    });
  }

  get trabalhosFiltrados(): TrabalhoFornecedor[] {
    if (this.tabAtiva === 'em_andamento') {
      return this.trabalhos.filter(t =>
        t.status === 'em_andamento' || t.status === 'em_garantia'
      );
    }
    if (this.tabAtiva === 'finalizadas') {
      return this.trabalhos.filter(t => t.status === 'finalizado');
    }
    if (this.tabAtiva === 'canceladas') {
      return this.trabalhos.filter(t => t.status === 'cancelado');
    }
    return this.trabalhos;
  }

  statusClass(status: StatusTrabalho): string {
    const classes: Record<StatusTrabalho, string> = {
      em_andamento: '',
      em_garantia:  'status--verde',
      finalizado:   'status--cinza',
      cancelado:    'status--vermelho',
    };
    return classes[status];
  }

  abrirTrabalho(trabalho: TrabalhoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/trabalho', trabalho.id]);
  }
}
