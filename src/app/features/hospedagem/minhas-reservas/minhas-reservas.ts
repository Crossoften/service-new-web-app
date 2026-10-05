import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AccommodationService } from '../../../core/services/accommodation';
import { BookingDto, BookingStatus } from '../../../core/models/booking';
import { ApiError } from '../../../core/models/common';

/** Reservas "ativas" = ainda em jogo (não terminais). O resto é histórico. */
const STATUS_ATIVOS: BookingStatus[] = ['Requested', 'Confirmed', 'CheckedIn'];

type AbaReservas = 'ativos' | 'historico';

@Component({
  selector: 'app-minhas-reservas',
  imports: [CommonModule],
  templateUrl: './minhas-reservas.html',
  styleUrl: './minhas-reservas.scss',
})
export class MinhasReservasComponent implements OnInit {
  private readonly accommodation = inject(AccommodationService);
  private readonly router = inject(Router);

  reservas: BookingDto[] = [];
  carregando = false;
  erro = '';
  aba: AbaReservas = 'ativos';

  ngOnInit() {
    this.carregando = true;
    this.accommodation
      .reservas({ participantRole: 'All' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.reservas = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar as reservas.';
        },
      });
  }

  ehAtivo(r: BookingDto): boolean {
    return STATUS_ATIVOS.includes(r.status);
  }

  selecionarAba(aba: AbaReservas) {
    this.aba = aba;
  }

  /** Reservas da aba atual: ativas (em jogo) ou histórico (terminais). */
  get reservasFiltradas(): BookingDto[] {
    const querAtivos = this.aba === 'ativos';
    return this.reservas.filter((r) => this.ehAtivo(r) === querAtivos);
  }

  abrir(id: number) {
    this.router.navigate(['/hospedagem/reserva', id]);
  }

  voltar() {
    history.back();
  }

  statusLabel(r: BookingDto): string {
    return this.accommodation.statusLabel(r.status);
  }

  formatarPreco(valor: string): string {
    return this.accommodation.formatarPreco(valor);
  }
}
