import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import {
  ServiceCatalogService,
  ServicoFornecedor,
} from '../../../../core/services/service-catalog';
import { BottomNavFornecedorServicosComponent } from '../../../../shared/components/bottom-nav-fornecedor-servicos/bottom-nav-fornecedor-servicos';
import { ApiError } from '../../../../core/models/common';

type TabServico = 'ativos' | 'inativos';

@Component({
  selector: 'app-listagem-servicos-fornecedor',
  imports: [CommonModule, BottomNavFornecedorServicosComponent],
  templateUrl: './listagem-servicos-fornecedor.html',
  styleUrl: './listagem-servicos-fornecedor.scss',
})
export class ListagemServicosFornecedorComponent implements OnInit {
  readonly router = inject(Router);
  private readonly catalog = inject(ServiceCatalogService);

  tabAtiva: TabServico = 'ativos';
  servicos: ServicoFornecedor[] = [];
  carregando = false;
  erro = '';

  tabs: { id: TabServico; label: string }[] = [
    { id: 'ativos', label: 'Ativos' },
    { id: 'inativos', label: 'Inativos' },
  ];

  ngOnInit() {
    this.carregarServicos();
  }

  carregarServicos() {
    this.carregando = true;
    this.erro = '';
    this.catalog
      .meusServicos(this.tabAtiva === 'ativos')
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => (this.servicos = lista),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar seus serviços.';
        },
      });
  }

  trocarTab(tab: TabServico) {
    this.tabAtiva = tab;
    this.carregarServicos();
  }

  adicionar() {
    this.router.navigate(['/fornecedor/servicos/criar']);
  }

  abrirServico(servico: ServicoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/criar'], { queryParams: { id: servico.id } });
  }

  voltar() {
    history.back();
  }
}
