import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AccommodationService } from '../../../core/services/accommodation';
import { AccommodationDto } from '../../../core/models/accommodation';
import { ApiError } from '../../../core/models/common';

const DIA_MS = 1000 * 60 * 60 * 24;

@Component({
  selector: 'app-detalhe-hospedagem',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalhe-hospedagem.html',
  styleUrl: './detalhe-hospedagem.scss',
})
export class DetalheHospedagemComponent implements OnInit {
  private readonly accommodation = inject(AccommodationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  acomodacaoId = 0;
  acomodacao?: AccommodationDto;
  carregando = false;
  processando = false;
  erro = '';
  sucesso = '';

  checkIn = '';
  checkOut = '';
  hospedes = 1;

  ngOnInit() {
    this.acomodacaoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.accommodation
      .acomodacao(this.acomodacaoId)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (a) => (this.acomodacao = a),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a hospedagem.';
        },
      });
  }

  get noites(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const diff = (new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) / DIA_MS;
    return diff > 0 ? Math.round(diff) : 0;
  }

  get totalEstimado(): number {
    return this.noites * Number(this.acomodacao?.price ?? 0);
  }

  reservar() {
    if (!this.acomodacao || this.processando) return;
    this.erro = '';
    if (!this.checkIn || !this.checkOut) {
      this.erro = 'Informe as datas de check-in e check-out.';
      return;
    }
    if (this.noites <= 0) {
      this.erro = 'O check-out deve ser posterior ao check-in.';
      return;
    }
    if (!this.hospedes || this.hospedes < 1) {
      this.erro = 'Informe o número de hóspedes.';
      return;
    }
    this.processando = true;
    this.accommodation
      .reservar({
        accommodationId: this.acomodacao.id,
        checkIn: new Date(this.checkIn).toISOString(),
        checkOut: new Date(this.checkOut).toISOString(),
        guests: this.hospedes,
        totalValue: this.totalEstimado,
      })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => {
          this.sucesso = 'Reserva solicitada! Aguarde a confirmação do anfitrião.';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível solicitar a reserva.';
        },
      });
  }

  verMinhasReservas() {
    this.router.navigate(['/hospedagem/reservas']);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor: number | string): string {
    return this.accommodation.formatarPreco(valor);
  }
}
