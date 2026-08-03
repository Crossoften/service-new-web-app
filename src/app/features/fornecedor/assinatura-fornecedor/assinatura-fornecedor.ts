import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../core/services/subscription';
import { ResponsePlanDto } from '../../../core/models/plan';
import { CreateSubscriptionDto } from '../../../core/models/subscription';
import { PaymentMethod } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

/**
 * Assinatura do fornecedor (onboarding pós-login).
 * Lista `GET /plans/active` e cria a assinatura via `POST /subscriptions` —
 * pré-condição para o fornecedor cadastrar restaurante/operar (BE-15).
 */
@Component({
  selector: 'app-assinatura-fornecedor',
  imports: [CommonModule, FormsModule],
  templateUrl: './assinatura-fornecedor.html',
  styleUrl: './assinatura-fornecedor.scss',
})
export class AssinaturaFornecedorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly subscriptions = inject(SubscriptionService);

  planos: ResponsePlanDto[] = [];
  planoSelecionado: number | null = null;
  metodo: PaymentMethod = 'CreditCard';

  // Cartão (quando método = CreditCard)
  nomeCartao = '';
  numeroCartao = '';

  carregando = false;
  assinando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.subscriptions.activePlans().subscribe({
      next: (res) => {
        this.carregando = false;
        this.planos = res.plans ?? [];
        this.planoSelecionado = this.planos.length ? this.planos[0].id : null;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os planos.';
      },
    });
  }

  get planoAtual(): ResponsePlanDto | null {
    return this.planos.find((p) => p.id === this.planoSelecionado) ?? null;
  }

  precoFmt(plan: ResponsePlanDto): string {
    const valor = Number(plan.price).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${valor}`;
  }

  intervaloLabel(plan: ResponsePlanDto): string {
    return plan.interval === 'Month' ? 'Mensal' : 'Anual';
  }

  selecionarMetodo(m: PaymentMethod) {
    this.metodo = m;
  }

  assinar() {
    this.erro = '';
    if (this.planoSelecionado == null) {
      this.erro = 'Selecione um plano.';
      return;
    }
    if (this.metodo === 'CreditCard') {
      if (!this.nomeCartao.trim()) {
        this.erro = 'Informe o nome do titular.';
        return;
      }
      if (this.numeroCartao.replace(/\D/g, '').length < 16) {
        this.erro = 'Informe um número de cartão válido.';
        return;
      }
    }
    this.assinando = true;
    this.subscriptions.create(this.buildDto()).subscribe({
      next: () => {
        this.assinando = false;
        // Assinatura ativa → volta para o cadastro do restaurante.
        this.router.navigate(['/fornecedor/restaurante']);
      },
      error: (err: ApiError) => {
        this.assinando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível concluir a assinatura.';
      },
    });
  }

  private buildDto(): CreateSubscriptionDto {
    const dto: CreateSubscriptionDto = {
      planId: this.planoSelecionado as number,
      method: this.metodo,
    };
    if (this.metodo === 'CreditCard') {
      const card = this.numeroCartao.replace(/\D/g, '');
      dto.holderName = this.nomeCartao.trim();
      dto.cardNumber = card;
      dto.cardBrand = this.detectBrand(card);
    }
    return dto;
  }

  private detectBrand(num: string): string {
    if (num.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    return 'Other';
  }

  voltar() {
    history.back();
  }
}
