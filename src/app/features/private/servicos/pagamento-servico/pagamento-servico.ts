import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FormaPagamento = 'credito' | 'debito' | 'pix' | 'dinheiro';

@Component({
  selector: 'app-pagamento-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagamento-servico.html',
  styleUrl: './pagamento-servico.scss'
})
export class PagamentoServicoComponent implements OnInit {
  solicitacaoId: number = 0;
  formaSelecionada: FormaPagamento = 'credito';
  formaPagamentoAberta: boolean = false;

  formasPagamento: { id: FormaPagamento; label: string }[] = [
    { id: 'credito',  label: 'Cartão de Crédito' },
    { id: 'debito',   label: 'Cartão de Débito' },
    { id: 'pix',      label: 'PIX' },
    { id: 'dinheiro', label: 'Dinheiro' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.solicitacaoId = Number(this.route.snapshot.paramMap.get('id'));
  }

  get formaSelecionadaLabel(): string {
    return this.formasPagamento.find(f => f.id === this.formaSelecionada)?.label ?? '';
  }

  togglePagamento() {
    this.formaPagamentoAberta = !this.formaPagamentoAberta;
  }

  selecionarForma(forma: FormaPagamento) {
    this.formaSelecionada = forma;
    this.formaPagamentoAberta = false;
  }

  efetuarPagamento() {
    this.router.navigate(['/servicos/solicitacoes']);
  }

  voltar() {
    history.back();
  }
}