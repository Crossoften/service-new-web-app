import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TransportService } from '../../../core/services/transport';
import { TransportRequestDto } from '../../../core/models/transport-request';
import { ApiError } from '../../../core/models/common';

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
