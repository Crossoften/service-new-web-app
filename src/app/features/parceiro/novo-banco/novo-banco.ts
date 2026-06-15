import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-novo-banco',
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-banco.html',
  styleUrl: './novo-banco.scss'
})
export class NovoBancoComponent {
  bancoSelecionado: string = 'Caixa econômica';
  tipoSelecionado: string = 'Conta corrente';
  agencia: string = '';
  conta: string = '';
  cpf: string = '';
  bancoAberto: boolean = false;
  tipoAberto: boolean = false;
  erro: string = '';

  bancos = [
    'Banco do Brasil',
    'Bradesco',
    'Caixa econômica',
    'Itaú',
    'Nubank',
    'Santander',
    'Sicredi',
  ];

  tipos = [
    'Conta corrente',
    'Conta poupança',
    'Conta salário',
  ];

  constructor(private router: Router) {}

  toggleBanco() { this.bancoAberto = !this.bancoAberto; this.tipoAberto = false; }
  toggleTipo() { this.tipoAberto = !this.tipoAberto; this.bancoAberto = false; }

  selecionarBanco(banco: string) {
    this.bancoSelecionado = banco;
    this.bancoAberto = false;
  }

  selecionarTipo(tipo: string) {
    this.tipoSelecionado = tipo;
    this.tipoAberto = false;
  }

  salvar() {
    this.erro = '';
    if (!this.agencia.trim()) { this.erro = 'Informe a agência.'; return; }
    if (!this.conta.trim()) { this.erro = 'Informe a conta.'; return; }
    if (!this.cpf.trim()) { this.erro = 'Informe o CPF.'; return; }
    this.router.navigate(['/parceiro/saldo']);
  }

  voltar() {
    history.back();
  }
}