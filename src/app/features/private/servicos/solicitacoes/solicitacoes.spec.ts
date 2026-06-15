import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicosService, Solicitacao, StatusSolicitacao } from '../../../../core/services/servicos';

type TabSolicitacao = 'em_andamento' | 'finalizadas' | 'canceladas';

@Component({
  selector: 'app-solicitacoes',
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.scss'
})
export class SolicitacoesComponent implements OnInit {
  solicitacoes: Solicitacao[] = [];
  tabAtiva: TabSolicitacao = 'em_andamento';

  tabs: { id: TabSolicitacao; label: string }[] = [
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'finalizadas',  label: 'Finalizadas' },
    { id: 'canceladas',   label: 'Canceladas' },
  ];

  constructor(
    private router: Router,
    private servicosService: ServicosService
  ) {}

  ngOnInit() {
    this.solicitacoes = this.servicosService.getSolicitacoes();
  }

  get solicitacoesFiltradas(): Solicitacao[] {
    if (this.tabAtiva === 'em_andamento') {
      return this.solicitacoes.filter(s =>
        s.status === 'em_andamento' || s.status === 'em_garantia'
      );
    }
    if (this.tabAtiva === 'finalizadas') {
      return this.solicitacoes.filter(s => s.status === 'finalizada');
    }
    if (this.tabAtiva === 'canceladas') {
      return this.solicitacoes.filter(s => s.status === 'cancelada');
    }
    return this.solicitacoes;
  }

  statusLabel(status: StatusSolicitacao): string {
    const labels: Record<StatusSolicitacao, string> = {
      em_andamento: 'Em andamento',
      em_garantia:  'Em garantia',
      finalizada:   'Finalizada',
      cancelada:    'Cancelada',
    };
    return labels[status];
  }

  statusClass(status: StatusSolicitacao): string {
    const classes: Record<StatusSolicitacao, string> = {
      em_andamento: 'status--laranja',
      em_garantia:  'status--verde',
      finalizada:   'status--cinza',
      cancelada:    'status--vermelho',
    };
    return classes[status];
  }

  voltar() {
    history.back();
  }
}