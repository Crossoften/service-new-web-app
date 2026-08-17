import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { BottomNavParceiroComponent } from '../../../shared/components/bottom-nav-parceiro/bottom-nav-parceiro';
import { ReferralsService } from '../../../core/services/referrals';
import { MyReferralDto } from '../../../core/models/referral';
import { UserProfileType } from '../../../core/models/enums';
import { ApiError } from '../../../core/models/common';

type TabIndicacao = 'todas' | 'ativas' | 'inativas';

interface IndicacaoItem {
  id: number;
  nome: string;
  profissao: string;
  descricao: string;
  foto: string;
  ativa: boolean;
}

const PERFIL_LABEL: Record<UserProfileType, string> = {
  Client: 'Cliente',
  Supplier: 'Fornecedor',
  Delivery: 'Entregador',
  Influencer: 'Parceiro',
};

@Component({
  selector: 'app-indicacoes',
  imports: [CommonModule, BottomNavParceiroComponent],
  templateUrl: './indicacoes.html',
  styleUrl: './indicacoes.scss',
})
export class IndicacoesComponent implements OnInit {
  private readonly referrals = inject(ReferralsService);

  tabAtiva: TabIndicacao = 'todas';
  carregando = false;
  erro = '';
  indicacoes: IndicacaoItem[] = [];

  tabs: { id: TabIndicacao; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'ativas', label: 'Ativas' },
    { id: 'inativas', label: 'Inativas' },
  ];

  ngOnInit() {
    this.carregando = true;
    this.referrals
      .me()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (res) => (this.indicacoes = (res.referrals ?? []).map((r) => this.toItem(r))),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as indicações.';
        },
      });
  }

  private toItem(r: MyReferralDto): IndicacaoItem {
    // "Ativa" = indicação já convertida (pagante). Demais = aguardando pagamento.
    const ativa = r.status === 'Convertido';
    return {
      id: r.id,
      nome: r.referredUser?.name ?? '—',
      profissao: r.referredUser ? PERFIL_LABEL[r.referredUser.profileType] : '',
      descricao: r.status,
      foto: '',
      ativa,
    };
  }

  get indicacoesFiltradas(): IndicacaoItem[] {
    if (this.tabAtiva === 'ativas') return this.indicacoes.filter((i) => i.ativa);
    if (this.tabAtiva === 'inativas') return this.indicacoes.filter((i) => !i.ativa);
    return this.indicacoes;
  }
}
