import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { BottomNavParceiroComponent } from '../../../shared/components/bottom-nav-parceiro/bottom-nav-parceiro';
import { ReferralsService } from '../../../core/services/referrals';
import { MyReferralDto } from '../../../core/models/referral';
import { UserProfileType } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

interface IndicacaoResumo {
  id: number;
  nome: string;
  profissao: string;
  descricao: string;
  foto: string;
}

const PERFIL_LABEL: Record<UserProfileType, string> = {
  Client: 'Cliente',
  Supplier: 'Fornecedor',
  Delivery: 'Entregador',
  Influencer: 'Parceiro',
};

@Component({
  selector: 'app-home-parceiro',
  imports: [CommonModule, BottomNavParceiroComponent],
  templateUrl: './home-parceiro.html',
  styleUrl: './home-parceiro.scss',
})
export class HomeParceiroComponent implements OnInit {
  private readonly referrals = inject(ReferralsService);

  link = '';
  linkCopiado = false;
  carregando = false;
  erro = '';

  stats = { downloads: 0, pagantes: 0, comissao: 0, ranking: 0 };
  ultimasIndicacoes: IndicacaoResumo[] = [];

  constructor(public router: Router) {}

  ngOnInit() {
    this.carregando = true;
    forkJoin({ summary: this.referrals.summary(), lista: this.referrals.me() }).subscribe({
      next: ({ summary, lista }) => {
        this.carregando = false;
        this.stats = {
          downloads: summary.totalReferrals,
          pagantes: summary.totalPaying,
          comissao: summary.accumulatedCommission,
          ranking: summary.rankingPosition,
        };
        const codigo = summary.referralCode ?? lista.referralCode ?? '';
        this.link = this.montarLink(codigo);
        this.ultimasIndicacoes = (lista.referrals ?? []).slice(0, 5).map((r) => this.toResumo(r));
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar suas indicações.';
      },
    });
  }

  private toResumo(r: MyReferralDto): IndicacaoResumo {
    return {
      id: r.id,
      nome: r.referredUser?.name ?? '—',
      profissao: r.referredUser ? PERFIL_LABEL[r.referredUser.profileType] : '',
      descricao: r.status,
      foto: '',
    };
  }

  private montarLink(codigo: string): string {
    if (!codigo) return '';
    const origin = typeof location !== 'undefined' ? location.origin : '';
    return `${origin}/cadastro/cliente?ref=${encodeURIComponent(codigo)}`;
  }

  copiarLink() {
    if (!this.link) return;
    navigator.clipboard?.writeText(this.link);
    this.linkCopiado = true;
    setTimeout(() => (this.linkCopiado = false), 2000);
  }

  compartilhar() {
    if (this.link && navigator.share) {
      navigator.share({ title: 'Service App', url: this.link });
    }
  }
}
