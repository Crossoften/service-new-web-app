import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { TransportService } from '../../../core/services/transport';
import { SessionService } from '../../../core/services/session';
import { TransportRequestDto } from '../../../core/models/transport-request';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-transporte-pedido-detalhe',
  imports: [CommonModule, FormsModule],
  templateUrl: './transporte-pedido-detalhe.html',
  styleUrl: './transporte-pedido-detalhe.scss',
})
export class TransportePedidoDetalheComponent implements OnInit {
  private readonly transport = inject(TransportService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id = 0;
  pedido?: TransportRequestDto;
  carregando = false;
  processando = false;
  erro = '';
  valorCotacao?: number;

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.transport
      .pedido(this.id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (p) => (this.pedido = p),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o pedido.';
        },
      });
  }

  get souSolicitante(): boolean {
    return !!this.pedido && this.session.userId() === this.pedido.requester.id;
  }

  get souTransportador(): boolean {
    return !!this.pedido && this.session.userId() === this.pedido.provider.id;
  }

  get podeCotar(): boolean {
    return this.souTransportador && this.pedido?.status === 'Requested';
  }

  get podeResponder(): boolean {
    return this.souSolicitante && this.pedido?.status === 'Quoted';
  }

  get podeIniciar(): boolean {
    return this.souTransportador && this.pedido?.status === 'Accepted';
  }

  get podeEntregar(): boolean {
    return this.souTransportador && this.pedido?.status === 'InTransit';
  }

  get podeCancelar(): boolean {
    const s = this.pedido?.status;
    return (
      (this.souSolicitante || this.souTransportador) &&
      (s === 'Requested' || s === 'Quoted' || s === 'Accepted' || s === 'InTransit')
    );
  }

  cotar() {
    if (this.valorCotacao === undefined || this.valorCotacao < 0) {
      this.erro = 'Informe um valor de cotação válido.';
      return;
    }
    this.executar(this.transport.cotar(this.id, { quotedValue: this.valorCotacao }));
  }
  aceitar() {
    this.executar(this.transport.responder(this.id, { status: 'Accepted' }));
  }
  recusar() {
    this.executar(this.transport.responder(this.id, { status: 'Rejected' }));
  }
  iniciar() {
    this.executar(this.transport.iniciar(this.id));
  }
  entregar() {
    this.executar(this.transport.entregar(this.id));
  }
  cancelar() {
    this.executar(this.transport.cancelar(this.id));
  }

  private executar(obs: Observable<TransportRequestDto>) {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    obs.pipe(finalize(() => (this.processando = false))).subscribe({
      next: (p) => (this.pedido = p),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar o pedido.';
      },
    });
  }

  abrirChat() {
    if (this.pedido) this.router.navigate(['/chat', this.pedido.chatRoomId]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor?: string): string {
    return this.transport.formatarPreco(valor);
  }

  get statusLabel(): string {
    return this.pedido ? this.transport.statusLabel(this.pedido.status) : '';
  }
}
