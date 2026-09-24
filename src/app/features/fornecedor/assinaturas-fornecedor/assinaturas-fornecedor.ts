import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../../core/services/subscription';
import {
  ResponseCatalogCategoryDto,
  ResponseCatalogSubscriptionDto,
} from '../../../core/models/subscription';
import { ApiError } from '../../../core/models/common';

type AcaoAssinatura = 'renovar' | 'reativar' | null;

/** Linha da tela de gestão: categoria assinada + status derivado + ação. */
interface AssinaturaVM {
  categoriaNome: string;
  sub: ResponseCatalogSubscriptionDto;
  statusTexto: string;
  destaque: boolean;
  acao: AcaoAssinatura;
  podeCancelar: boolean;
}

/**
 * Gestão das assinaturas por categoria (fornecedor).
 *
 * Lê `GET /subscriptions/catalog` e, para cada categoria assinada, deriva o
 * status a partir dos campos do back na ordem de prioridade
 * (cancelAtPeriodEnd → expired → inGracePeriod → needsRenewal → ativa) e oferece
 * a ação certa: Renovar (`POST /:id/renew` → checkout), Reativar
 * (`PATCH /:id/reactivate`) ou Cancelar (`PATCH /:id/cancel`, agenda o fim do
 * período). Só front — consome o contrato já entregue.
 */
@Component({
  selector: 'app-assinaturas-fornecedor',
  imports: [CommonModule],
  templateUrl: './assinaturas-fornecedor.html',
  styleUrl: './assinaturas-fornecedor.scss',
})
export class AssinaturasFornecedorComponent implements OnInit {
  private readonly subscriptions = inject(SubscriptionService);
  private readonly router = inject(Router);

  assinaturas: AssinaturaVM[] = [];
  temCategoriaDisponivel = false;

  carregando = false;
  processandoId: number | null = null;
  erro = '';

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.subscriptions.catalog().subscribe({
      next: (res) => {
        this.carregando = false;
        const categorias = res.categories ?? [];
        this.temCategoriaDisponivel = categorias.some((c) => !c.isSubscribed);
        this.assinaturas = categorias
          .filter((c) => c.isSubscribed && c.subscription)
          .map((c) => this.montarVM(c));
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar suas assinaturas.';
      },
    });
  }

  private montarVM(cat: ResponseCatalogCategoryDto): AssinaturaVM {
    const sub = cat.subscription as ResponseCatalogSubscriptionDto;
    const ate = this.dataFmt(sub.currentPeriodEnd);
    const dias = sub.daysUntilExpiration ?? 0;

    // Prioridade dos campos derivados (a ordem importa).
    let statusTexto: string;
    let destaque = false;
    let acao: AcaoAssinatura = null;
    let podeCancelar = false;

    if (sub.cancelAtPeriodEnd) {
      statusTexto = ate ? `Ativa até ${ate} · não renova` : 'Não renova';
      acao = 'reativar';
    } else if (sub.expired) {
      statusTexto = 'Vencida';
      destaque = true;
      acao = 'renovar';
    } else if (sub.inGracePeriod) {
      statusTexto = dias > 0 ? `Vencida — regularize em ${dias} ${dias === 1 ? 'dia' : 'dias'}` : 'Vencida — regularize';
      destaque = true;
      acao = 'renovar';
    } else if (sub.needsRenewal) {
      statusTexto = dias > 0 ? `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}` : 'Vence em breve';
      acao = 'renovar';
      podeCancelar = true;
    } else {
      statusTexto = ate ? `Ativa até ${ate}` : 'Ativa';
      podeCancelar = true;
    }

    return { categoriaNome: cat.name, sub, statusTexto, destaque, acao, podeCancelar };
  }

  renovar(vm: AssinaturaVM) {
    if (this.processandoId != null) return;
    this.processandoId = vm.sub.id;
    this.erro = '';
    this.subscriptions.renew(vm.sub.id).subscribe({
      next: (res) => {
        // Conclui o pagamento no checkout do Mercado Pago.
        window.location.href = res.checkoutUrl;
      },
      error: (err: ApiError) => {
        this.processandoId = null;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível renovar a assinatura.';
      },
    });
  }

  reativar(vm: AssinaturaVM) {
    if (this.processandoId != null) return;
    this.processandoId = vm.sub.id;
    this.erro = '';
    this.subscriptions.reactivate(vm.sub.id).subscribe({
      next: () => this.aposAcao(),
      error: (err: ApiError) => this.falhaAcao(err, 'Não foi possível reativar a assinatura.'),
    });
  }

  cancelar(vm: AssinaturaVM) {
    if (this.processandoId != null) return;
    this.processandoId = vm.sub.id;
    this.erro = '';
    this.subscriptions.cancel(vm.sub.id).subscribe({
      next: () => this.aposAcao(),
      error: (err: ApiError) => this.falhaAcao(err, 'Não foi possível cancelar a assinatura.'),
    });
  }

  private aposAcao() {
    this.processandoId = null;
    this.carregar();
  }

  private falhaAcao(err: ApiError, fallback: string) {
    this.processandoId = null;
    this.erro = err?.message?.trim() ? err.message : fallback;
  }

  assinarNova() {
    this.router.navigate(['/fornecedor/assinatura']);
  }

  voltar() {
    history.back();
  }

  private dataFmt(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
  }
}
