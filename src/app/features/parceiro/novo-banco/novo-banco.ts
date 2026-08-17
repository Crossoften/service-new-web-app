import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankAccountService } from '../../../core/services/bank-account';
import { BankAccountType } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-novo-banco',
  imports: [CommonModule, FormsModule],
  templateUrl: './novo-banco.html',
  styleUrl: './novo-banco.scss',
})
export class NovoBancoComponent {
  private readonly bankAccount = inject(BankAccountService);

  bancoSelecionado = 'Caixa econômica';
  tipoSelecionado = 'Conta corrente';
  agencia = '';
  conta = '';
  cpf = '';
  bancoAberto = false;
  tipoAberto = false;
  erro = '';
  salvando = false;

  bancos = [
    'Banco do Brasil',
    'Bradesco',
    'Caixa econômica',
    'Itaú',
    'Nubank',
    'Santander',
    'Sicredi',
  ];

  tipos = ['Conta corrente', 'Conta poupança', 'Conta salário'];

  constructor(private router: Router) {}

  toggleBanco() {
    this.bancoAberto = !this.bancoAberto;
    this.tipoAberto = false;
  }
  toggleTipo() {
    this.tipoAberto = !this.tipoAberto;
    this.bancoAberto = false;
  }

  selecionarBanco(banco: string) {
    this.bancoSelecionado = banco;
    this.bancoAberto = false;
  }

  selecionarTipo(tipo: string) {
    this.tipoSelecionado = tipo;
    this.tipoAberto = false;
  }

  salvar() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.agencia.trim()) {
      this.erro = 'Informe a agência.';
      return;
    }
    if (!this.conta.trim()) {
      this.erro = 'Informe a conta.';
      return;
    }
    if (!this.cpf.trim()) {
      this.erro = 'Informe o CPF.';
      return;
    }
    this.salvando = true;
    this.bankAccount
      .criar({
        bankName: this.bancoSelecionado,
        accountType: this.mapTipo(this.tipoSelecionado),
        agency: this.agencia.trim(),
        account: this.conta.trim(),
        cpf: this.cpf.replace(/\D/g, ''),
      })
      .pipe(finalize(() => (this.salvando = false)))
      .subscribe({
        next: () => this.router.navigate(['/parceiro/saldo']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar os dados bancários.';
        },
      });
  }

  /** 'Conta poupança' → Savings; demais → Checking. */
  private mapTipo(tipo: string): BankAccountType {
    return tipo === 'Conta poupança' ? 'Savings' : 'Checking';
  }

  voltar() {
    history.back();
  }
}
