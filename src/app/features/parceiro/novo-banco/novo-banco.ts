import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankAccountService } from '../../../core/services/bank-account';
import { BankAccountType, PixKeyType } from '../../../core/models/enums';
import { CreateBankAccountDto } from '../../../core/models/bank-account';
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

  // Chave Pix (§8.5) — opcional; tipo e chave andam juntos.
  pixTipoSelecionado = '';
  pixChave = '';
  pixAberto = false;
  pixTipos: { id: PixKeyType; label: string }[] = [
    { id: 'Cpf', label: 'CPF' },
    { id: 'Cnpj', label: 'CNPJ' },
    { id: 'Email', label: 'E-mail' },
    { id: 'Phone', label: 'Telefone' },
    { id: 'Random', label: 'Chave aleatória' },
  ];

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

  togglePix() {
    this.pixAberto = !this.pixAberto;
    this.bancoAberto = false;
    this.tipoAberto = false;
  }

  selecionarPixTipo(tipo: string) {
    this.pixTipoSelecionado = tipo;
    this.pixAberto = false;
  }

  get pixTipoLabel(): string {
    return this.pixTipos.find((t) => t.id === this.pixTipoSelecionado)?.label ?? 'Nenhuma';
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
    // Pix: tipo e chave andam juntos (§8.5) — evita o 400 do back.
    const temTipo = !!this.pixTipoSelecionado;
    const temChave = !!this.pixChave.trim();
    if (temTipo !== temChave) {
      this.erro = 'Preencha o tipo e a chave Pix, ou deixe ambos em branco.';
      return;
    }
    this.salvando = true;
    const dto: CreateBankAccountDto = {
      bankName: this.bancoSelecionado,
      accountType: this.mapTipo(this.tipoSelecionado),
      agency: this.agencia.trim(),
      account: this.conta.trim(),
      cpf: this.cpf.replace(/\D/g, ''),
    };
    if (temTipo && temChave) {
      dto.pixKeyType = this.pixTipoSelecionado as PixKeyType;
      dto.pixKey = this.pixChave.trim();
    }
    this.bankAccount
      .criar(dto)
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
