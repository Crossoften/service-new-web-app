import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BudgetService, OrcamentoFornecedor } from '../../../../core/services/budget';
import { ApiError } from '../../../../core/models/common';

@Component({
  selector: 'app-fazer-orcamento',
  imports: [CommonModule, FormsModule],
  templateUrl: './fazer-orcamento.html',
  styleUrl: './fazer-orcamento.scss',
})
export class FazerOrcamentoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly budgets = inject(BudgetService);

  orcamentoId = 0;
  orcamento?: OrcamentoFornecedor;
  mostrarModalMaisInfos = false;

  // Previsão
  dataInicio = '';
  diasPrevistos = '7 dias';
  diasAberto = false;
  diasOpcoes = ['3 dias', '7 dias', '15 dias', '30 dias', '60 dias'];

  // Detalhes
  valor = '';
  formaPagamento = 'Parcelado/Tipo pag';
  pagamentoAberto = false;
  formasPagamento = ['À vista', 'Parcelado/Tipo pag', 'PIX', 'Boleto'];

  // Garantia
  garantia = '6 meses';

  // Descrição
  descricao = '';

  // Mais informações
  maisInfosDescricao = '';
  maisInfosArquivos: { id: number; nome: string; tipo: string }[] = [];

  erro = '';
  enviando = false;

  ngOnInit() {
    this.orcamentoId = Number(this.route.snapshot.paramMap.get('id'));
    this.budgets.orcamentoFornecedor(this.orcamentoId).subscribe({
      next: (o) => (this.orcamento = o),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o orçamento.';
      },
    });
  }

  toggleDias() {
    this.diasAberto = !this.diasAberto;
    this.pagamentoAberto = false;
  }
  togglePagamento() {
    this.pagamentoAberto = !this.pagamentoAberto;
    this.diasAberto = false;
  }

  selecionarDias(dias: string) {
    this.diasPrevistos = dias;
    this.diasAberto = false;
  }
  selecionarPagamento(forma: string) {
    this.formaPagamento = forma;
    this.pagamentoAberto = false;
  }

  abrirMaisInfos() {
    this.mostrarModalMaisInfos = true;
  }
  fecharMaisInfos() {
    this.mostrarModalMaisInfos = false;
  }

  confirmarMaisInfos() {
    const message = this.maisInfosDescricao.trim();
    if (!message) {
      this.mostrarModalMaisInfos = false;
      return;
    }
    this.budgets.pedirMaisInfo(this.orcamentoId, { message }).subscribe({
      next: () => {
        this.mostrarModalMaisInfos = false;
        this.maisInfosDescricao = '';
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível pedir mais informações.';
        this.mostrarModalMaisInfos = false;
      },
    });
  }

  adicionarArquivoMaisInfos() {
    // Upload real de anexos em fatia posterior.
  }

  enviar() {
    if (this.enviando) return;
    this.erro = '';
    if (!this.valor || isNaN(Number(this.valor))) {
      this.erro = 'Informe um valor válido.';
      return;
    }
    const responseDescription = [
      this.descricao.trim(),
      `Pagamento: ${this.formaPagamento}`,
      `Garantia: ${this.garantia}`,
    ]
      .filter(Boolean)
      .join(' · ');

    this.enviando = true;
    this.budgets
      .responderOrcamento(this.orcamentoId, {
        status: 'Responded',
        responseValue: Number(this.valor),
        responseTimeQuantity: this.diasNumero(),
        responseTimeUnit: 'Day',
        responseDescription,
      })
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: () => this.router.navigate(['/fornecedor/servicos/trabalhos']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar o orçamento.';
        },
      });
  }

  private diasNumero(): number {
    const n = parseInt(this.diasPrevistos, 10);
    return Number.isFinite(n) && n > 0 ? n : 7;
  }

  voltar() {
    history.back();
  }
}
