import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type TabSaldo = 'historico' | 'bancos';

@Component({
  selector: 'app-saldo',
  imports: [CommonModule],
  templateUrl: './saldo.html',
  styleUrl: './saldo.scss'
})
export class SaldoComponent {
  tabAtiva: TabSaldo = 'historico';
  saldoMes: number = 2000.00;

  historico = [
    { id: 1, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', valor: 0, foto: '' },
    { id: 2, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', valor: 0, foto: '' },
    { id: 3, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', valor: 0, foto: '' },
    { id: 4, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', valor: 0, foto: '' },
    { id: 5, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', valor: 0, foto: '' },
  ];

  bancos = [
    { id: 1, banco: 'Itaú', tipo: 'Conta corrente', agencia: '0000', conta: '000000', cpf: '000000-00' },
  ];

  constructor(private router: Router) {}

  adicionarBanco() {
    this.router.navigate(['/parceiro/banco/novo']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}