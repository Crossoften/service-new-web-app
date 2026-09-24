import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../../core/services/subscription';
import { ResponsePlanDto } from '../../../core/models/plan';
import {
  CreateSubscriptionDto,
  ResponseCatalogCategoryDto,
} from '../../../core/models/subscription';
import { ApiError } from '../../../core/models/common';

/**
 * Contratação de assinatura por categoria (fornecedor).
 *
 * Carrega `GET /subscriptions/catalog` (planos + categorias assináveis) e cria a
 * assinatura via `POST /subscriptions` com `planId` + `categoryId`. O pagamento
 * é concluído no checkout do Mercado Pago: a resposta traz `checkoutUrl` e o
 * browser é redirecionado (não há mais coleta de cartão no app).
 */
@Component({
  selector: 'app-assinatura-fornecedor',
  imports: [CommonModule, FormsModule],
  templateUrl: './assinatura-fornecedor.html',
  styleUrl: './assinatura-fornecedor.scss',
})
export class AssinaturaFornecedorComponent implements OnInit {
  private readonly subscriptions = inject(SubscriptionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  planos: ResponsePlanDto[] = [];
  categorias: ResponseCatalogCategoryDto[] = [];

  categoriaSelecionada: number | null = null;
  planoSelecionado: number | null = null;
  payerEmail = '';

  carregando = false;
  assinando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.subscriptions.catalog().subscribe({
      next: (res) => {
        this.carregando = false;
        this.planos = res.plans ?? [];
        this.categorias = res.categories ?? [];
        this.planoSelecionado = this.planos.length ? this.planos[0].id : null;
        if (this.aplicarCategoriaDaRota()) return; // redirecionou (categoria vencida)
        // Sem pré-seleção pela rota: usa a primeira categoria ainda não assinada.
        if (this.categoriaSelecionada == null) {
          const disponivel = this.categorias.find((c) => !c.isSubscribed);
          this.categoriaSelecionada = disponivel ? disponivel.id : null;
        }
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o catálogo de assinaturas.';
      },
    });
  }

  get temCategoriasDisponiveis(): boolean {
    return this.categorias.some((c) => !c.isSubscribed);
  }

  /**
   * Aplica o `?categoryId` da rota (vindo do `403` por categoria).
   * Categoria disponível → pré-seleciona; já assinada (vencida) → manda renovar
   * na tela de gestão. Retorna `true` quando redirecionou (aborta o resto).
   */
  private aplicarCategoriaDaRota(): boolean {
    const raw = this.route.snapshot.queryParamMap.get('categoryId');
    if (raw == null) return false;
    const alvo = Number(raw);
    if (!Number.isFinite(alvo)) return false;
    const cat = this.categorias.find((c) => c.id === alvo);
    if (!cat) return false;
    if (cat.isSubscribed) {
      this.router.navigate(['/fornecedor/assinaturas']);
      return true;
    }
    this.categoriaSelecionada = cat.id;
    return false;
  }

  selecionarCategoria(cat: ResponseCatalogCategoryDto) {
    if (cat.isSubscribed) return;
    this.categoriaSelecionada = cat.id;
    this.erro = '';
  }

  precoFmt(valor?: number | string): string {
    const n = typeof valor === 'string' ? Number(valor) : (valor ?? 0);
    const fmt = (Number.isFinite(n) ? n : 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${fmt}`;
  }

  /** Rótulo do ciclo do plano (usa o nome vindo do back — Mensal/Semestral/Anual). */
  cicloLabel(plan: ResponsePlanDto): string {
    if (plan.name?.trim()) return plan.name;
    if (plan.interval === 'Year') return plan.intervalCount > 1 ? `${plan.intervalCount} anos` : 'Anual';
    return plan.intervalCount > 1 ? `${plan.intervalCount} meses` : 'Mensal';
  }

  assinar() {
    this.erro = '';
    if (this.categoriaSelecionada == null) {
      this.erro = 'Selecione uma categoria.';
      return;
    }
    if (this.planoSelecionado == null) {
      this.erro = 'Selecione um plano.';
      return;
    }
    this.assinando = true;
    this.subscriptions.create(this.buildDto()).subscribe({
      next: (res) => {
        this.assinando = false;
        // Conclui o pagamento no checkout do Mercado Pago.
        window.location.href = res.checkoutUrl;
      },
      error: (err: ApiError) => {
        this.assinando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível iniciar a assinatura.';
      },
    });
  }

  private buildDto(): CreateSubscriptionDto {
    const dto: CreateSubscriptionDto = {
      planId: this.planoSelecionado as number,
      categoryId: this.categoriaSelecionada as number,
    };
    const email = this.payerEmail.trim();
    if (email) dto.payerEmail = email;
    return dto;
  }

  voltar() {
    history.back();
  }
}
