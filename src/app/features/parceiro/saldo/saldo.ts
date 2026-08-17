import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, finalize, of } from 'rxjs';
import { BalanceService } from '../../../core/services/balance';
import { BankAccountService } from '../../../core/services/bank-account';
import { BalanceReceiptItemDto } from '../../../core/models/balance';
import { BankAccountType } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

type TabSaldo = 'historico' | 'bancos';

interface HistoricoItem {
  id: number;
  nome: string;
  profissao: string;
  descricao: string;
  valor: number;
  foto: string;
}

interface BancoView {
  id: number;
  banco: string;
  tipo: string;
  agencia: string;
  conta: string;
  cpf: string;
}

const TIPO_CONTA_LABEL: Record<BankAccountType, string> = {
  Checking: 'Conta corrente',
  Savings: 'Conta poupança',
};

@Component({
  selector: 'app-saldo',
  imports: [CommonModule],
  templateUrl: './saldo.html',
  styleUrl: './saldo.scss',
})
export class SaldoComponent implements OnInit {
  private readonly balance = inject(BalanceService);
  private readonly bankAccount = inject(BankAccountService);

  tabAtiva: TabSaldo = 'historico';
  saldoMes = 0;
  carregando = false;
  erro = '';

  historico: HistoricoItem[] = [];
  bancos: BancoView[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.carregando = true;
    this.balance
      .receipts()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (res) => {
          this.saldoMes = Number(res.currentMonthBalance) || 0;
          this.historico = (res.recentReceipts ?? []).map((r) => this.toHistorico(r));
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o saldo.';
        },
      });

    // Conta bancária é opcional; se não houver (404/500), mantém lista vazia.
    this.bankAccount
      .me()
      .pipe(catchError(() => of(null)))
      .subscribe((conta) => {
        this.bancos = conta
          ? [
              {
                id: conta.id,
                banco: conta.bankName,
                tipo: TIPO_CONTA_LABEL[conta.accountType],
                agencia: conta.agency,
                conta: conta.account,
                cpf: conta.cpf,
              },
            ]
          : [];
      });
  }

  private toHistorico(r: BalanceReceiptItemDto): HistoricoItem {
    return {
      id: r.id,
      nome: r.payer?.name ?? '—',
      profissao: r.service?.name ?? r.method ?? '',
      descricao: r.description ?? '',
      valor: Number(r.amount) || 0,
      foto: r.payer?.fileUrl ?? '',
    };
  }

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
