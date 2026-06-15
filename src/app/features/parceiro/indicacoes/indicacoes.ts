import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavParceiroComponent } from '../../../shared/components/bottom-nav-parceiro/bottom-nav-parceiro';

type TabIndicacao = 'todas' | 'ativas' | 'inativas';

@Component({
  selector: 'app-indicacoes',
  imports: [CommonModule, BottomNavParceiroComponent],
  templateUrl: './indicacoes.html',
  styleUrl: './indicacoes.scss'
})
export class IndicacoesComponent {
  tabAtiva: TabIndicacao = 'todas';

  tabs: { id: TabIndicacao; label: string }[] = [
    { id: 'todas',    label: 'Todas' },
    { id: 'ativas',   label: 'Ativas' },
    { id: 'inativas', label: 'Inativas' },
  ];

  indicacoes = [
    { id: 1, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '', ativa: true },
    { id: 2, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '', ativa: true },
    { id: 3, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '', ativa: false },
    { id: 4, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '', ativa: true },
    { id: 5, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '', ativa: false },
    { id: 6, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '', ativa: true },
  ];

  get indicacoesFiltradas() {
    if (this.tabAtiva === 'ativas') return this.indicacoes.filter(i => i.ativa);
    if (this.tabAtiva === 'inativas') return this.indicacoes.filter(i => !i.ativa);
    return this.indicacoes;
  }
}