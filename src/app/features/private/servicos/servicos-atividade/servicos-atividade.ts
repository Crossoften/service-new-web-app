import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkService, Solicitacao } from '../../../../core/services/work';
import { BudgetService, Orcamento } from '../../../../core/services/budget';
import { BottomNavClienteComponent } from '../../../../shared/components/bottom-nav-cliente/bottom-nav-cliente';

type AbaAtividade = 'ativos' | 'historico';

/** Item da atividade de Serviços (orçamento ou trabalho), já sem jargão para o cliente. */
interface ItemServico {
  titulo: string;
  subtitulo: string;
  destaque: boolean;
  ativo: boolean;
  rota: (string | number)[];
}

/**
 * Tela de atividade de **Serviços** do cliente (E2E-1b). Une as duas etapas —
 * **Orçamentos** (budgets) e **Trabalhos** (works) — numa jornada só, com abas
 * **Ativos / Histórico**. As ações do domínio (garantia, pagamento, etc.) ficam no
 * **detalhe** de cada item (aprovar-orcamento / detalhes-solicitacao).
 */
@Component({
  selector: 'app-servicos-atividade',
  imports: [CommonModule, BottomNavClienteComponent],
  templateUrl: './servicos-atividade.html',
  styleUrl: './servicos-atividade.scss',
})
export class ServicosAtividadeComponent implements OnInit {
  private readonly works = inject(WorkService);
  private readonly budgets = inject(BudgetService);
  private readonly router = inject(Router);

  carregando = false;
  aba: AbaAtividade = 'ativos';
  itens: ItemServico[] = [];

  ngOnInit() {
    this.carregando = true;
    forkJoin({
      solicitacoes: this.works.minhasSolicitacoes().pipe(catchError(() => of([] as Solicitacao[]))),
      orcamentos: this.budgets
        .meus({ scope: 'Requested' })
        .pipe(catchError(() => of([] as Orcamento[]))),
    }).subscribe({
      next: ({ solicitacoes, orcamentos }) => {
        this.itens = [
          ...orcamentos.map((o) => this.deOrcamento(o)),
          ...solicitacoes.map((s) => this.deSolicitacao(s)),
        ].sort((a, b) => Number(b.destaque) - Number(a.destaque));
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  selecionarAba(aba: AbaAtividade) {
    this.aba = aba;
  }

  get itensFiltrados(): ItemServico[] {
    const querAtivos = this.aba === 'ativos';
    return this.itens.filter((i) => i.ativo === querAtivos);
  }

  abrir(item: ItemServico) {
    this.router.navigate(item.rota);
  }

  voltar() {
    history.back();
  }

  // ── Mapeamento ──────────────────────────────────────────────────────────────

  private deOrcamento(o: Orcamento): ItemServico {
    const ativo =
      o.statusApi === 'Pending' || o.statusApi === 'Responded' || o.statusApi === 'WaitingInformation';
    let subtitulo: string;
    let destaque = false;
    if (o.temAcrescimoPendente) {
      subtitulo = 'Acréscimo aguardando sua resposta';
      destaque = true;
    } else if (o.statusApi === 'Responded') {
      subtitulo = 'Orçamento respondido — responda';
      destaque = true;
    } else if (o.statusApi === 'WaitingInformation') {
      subtitulo = 'O prestador pediu mais informações';
      destaque = true;
    } else if (o.statusApi === 'Pending') {
      subtitulo = 'Aguardando resposta do prestador';
    } else if (o.statusApi === 'Accepted') {
      subtitulo = 'Orçamento aceito';
    } else if (o.statusApi === 'Rejected') {
      subtitulo = 'Orçamento recusado';
    } else {
      subtitulo = 'Orçamento cancelado';
    }
    return {
      titulo: o.prestador.profissao || o.prestador.nome,
      subtitulo,
      destaque,
      ativo,
      rota: ['/servicos/orcamento', o.id],
    };
  }

  private deSolicitacao(s: Solicitacao): ItemServico {
    const ativo = s.status === 'em_andamento' || s.status === 'em_garantia';
    let subtitulo: string;
    let destaque = false;
    if (s.extraPendente) {
      subtitulo = 'Acréscimo aguardando sua resposta';
      destaque = true;
    } else if (s.status === 'em_garantia') {
      subtitulo = 'Em garantia';
    } else if (s.status === 'em_andamento') {
      subtitulo = 'Serviço em andamento';
    } else if (s.status === 'finalizada') {
      subtitulo = 'Serviço finalizado';
    } else {
      subtitulo = 'Serviço cancelado';
    }
    return {
      titulo: s.prestador.profissao || s.prestador.nome,
      subtitulo,
      destaque,
      ativo,
      rota: ['/servicos/solicitacao', s.id],
    };
  }
}
