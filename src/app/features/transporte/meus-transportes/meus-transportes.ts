import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TransportService } from '../../../core/services/transport';
import { TransportRequestDto, TransportRequestStatus } from '../../../core/models/transport-request';
import { ApiError } from '../../../core/models/common';

/** Pedidos "ativos" = ainda em jogo (não terminais). O resto é histórico. */
const STATUS_ATIVOS: TransportRequestStatus[] = ['Requested', 'Quoted', 'Accepted', 'InTransit'];

type AbaTransportes = 'ativos' | 'historico';

@Component({
  selector: 'app-meus-transportes',
  imports: [CommonModule],
  templateUrl: './meus-transportes.html',
  styleUrl: './meus-transportes.scss',
})
export class MeusTransportesComponent implements OnInit {
  private readonly transport = inject(TransportService);
  private readonly router = inject(Router);

  pedidos: TransportRequestDto[] = [];
  carregando = false;
  erro = '';
  aba: AbaTransportes = 'ativos';

  ngOnInit() {
    this.carregando = true;
    this.transport
      .pedidos({ participantRole: 'All' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.pedidos = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os pedidos.';
        },
      });
  }

  ehAtivo(p: TransportRequestDto): boolean {
    return STATUS_ATIVOS.includes(p.status);
  }

  selecionarAba(aba: AbaTransportes) {
    this.aba = aba;
  }

  /** Pedidos da aba atual: ativos (em jogo) ou histórico (terminais). */
  get pedidosFiltrados(): TransportRequestDto[] {
    const querAtivos = this.aba === 'ativos';
    return this.pedidos.filter((p) => this.ehAtivo(p) === querAtivos);
  }

  abrir(id: number) {
    this.router.navigate(['/transporte/pedido', id]);
  }

  voltar() {
    history.back();
  }

  statusLabel(p: TransportRequestDto): string {
    return this.transport.statusLabel(p.status);
  }
}
