import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorServicosService, OrcamentoFornecedor } from '../../../../core/services/fornecedor-servicos';
import { BottomNavFornecedorServicosComponent } from '../../../../shared/components/bottom-nav-fornecedor-servicos/bottom-nav-fornecedor-servicos';

type TabOrcamento = 'todos' | 'respondidos' | 'nao_respondidos';

@Component({
  selector: 'app-orcamentos-fornecedor',
  imports: [CommonModule, FormsModule, BottomNavFornecedorServicosComponent],
  templateUrl: './orcamentos-fornecedor.html',
  styleUrl: './orcamentos-fornecedor.scss'
})
export class OrcamentosFornecedorComponent implements OnInit {
  orcamentos: OrcamentoFornecedor[] = [];
  tabAtiva: TabOrcamento = 'todos';
  busca: string = '';
  filtroAberto: boolean = false;

  tabs: { id: TabOrcamento; label: string }[] = [
    { id: 'todos',           label: 'Todos' },
    { id: 'respondidos',     label: 'Respondidos' },
    { id: 'nao_respondidos', label: 'Não Respondidos' },
  ];

  constructor(
    public router: Router,
    private fornecedorServicosService: FornecedorServicosService
  ) {}

  ngOnInit() {
    this.orcamentos = this.fornecedorServicosService.getOrcamentos();
  }

  get orcamentosFiltrados(): OrcamentoFornecedor[] {
    if (!this.busca.trim()) return this.orcamentos;
    return this.orcamentos.filter(o =>
      o.cliente.toLowerCase().includes(this.busca.toLowerCase())
    );
  }

  toggleFiltro() {
    this.filtroAberto = !this.filtroAberto;
  }

  abrirOrcamento(orcamento: OrcamentoFornecedor) {
    this.router.navigate(['/fornecedor/servicos/orcamento', orcamento.id]);
  }
}