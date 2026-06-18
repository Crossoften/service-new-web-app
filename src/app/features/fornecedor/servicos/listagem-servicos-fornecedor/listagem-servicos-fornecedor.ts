import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FornecedorServicosService, ServicoFornecedor } from '../../../../core/services/fornecedor-servicos';
import { BottomNavFornecedorServicosComponent } from '../../../../shared/components/bottom-nav-fornecedor-servicos/bottom-nav-fornecedor-servicos';

type TabServico = 'ativos' | 'inativos';

@Component({
  selector: 'app-listagem-servicos-fornecedor',
  imports: [CommonModule, BottomNavFornecedorServicosComponent],
  templateUrl: './listagem-servicos-fornecedor.html',
  styleUrl: './listagem-servicos-fornecedor.scss'
})
export class ListagemServicosFornecedorComponent implements OnInit {
  tabAtiva: TabServico = 'ativos';
  servicos: ServicoFornecedor[] = [];

  tabs: { id: TabServico; label: string }[] = [
    { id: 'ativos',   label: 'Ativos' },
    { id: 'inativos', label: 'Inativos' },
  ];

  constructor(
    public router: Router,
    private fornecedorServicosService: FornecedorServicosService
  ) {}

  ngOnInit() {
    this.carregarServicos();
  }

  carregarServicos() {
    this.servicos = this.fornecedorServicosService.getServicos(this.tabAtiva === 'ativos');
  }

  trocarTab(tab: TabServico) {
    this.tabAtiva = tab;
    this.carregarServicos();
  }

  adicionar() {
    this.router.navigate(['/fornecedor/servicos/categoria']);
  }

  abrirServico(servico: ServicoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/criar'], {
      queryParams: { id: servico.id }
    });
  }

  voltar() {
    history.back();
  }
}