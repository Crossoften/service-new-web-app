import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TransportService } from '../../../core/services/transport';
import { TransportationDto } from '../../../core/models/transportation';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-detalhe-transporte',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhe-transporte.html',
  styleUrl: './detalhe-transporte.scss',
})
export class DetalheTransporteComponent implements OnInit {
  private readonly transport = inject(TransportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  transporteId = 0;
  transporte?: TransportationDto;
  carregando = false;
  processando = false;
  erro = '';
  sucesso = '';

  origem = '';
  destino = '';
  carga = '';

  ngOnInit() {
    this.transporteId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.transport
      .transporte(this.transporteId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (t) => (this.transporte = t),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o veículo.';
        },
      });
  }

  solicitar() {
    if (!this.transporte || this.processando) return;
    this.erro = '';
    if (!this.origem.trim() || !this.destino.trim()) {
      this.erro = 'Informe origem e destino.';
      return;
    }
    this.processando = true;
    this.transport
      .solicitar({
        transportationId: this.transporte.id,
        origin: this.origem.trim(),
        destination: this.destino.trim(),
        cargoDescription: this.carga.trim() || undefined,
      })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Pedido enviado! Aguarde a cotação do transportador.';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível solicitar o transporte.';
        },
      });
  }

  verMeusPedidos() {
    this.router.navigate(['/transporte/meus']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: string): string {
    return this.transport.formatarPreco(valor);
  }
}
