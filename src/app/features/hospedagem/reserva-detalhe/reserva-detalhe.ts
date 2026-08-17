import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { AccommodationService } from '../../../core/services/accommodation';
import { SessionService } from '../../../core/services/session';
import { BookingDto } from '../../../core/models/booking';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-reserva-detalhe',
  imports: [CommonModule],
  templateUrl: './reserva-detalhe.html',
  styleUrl: './reserva-detalhe.scss',
})
export class ReservaDetalheComponent implements OnInit {
  private readonly accommodation = inject(AccommodationService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id = 0;
  reserva?: BookingDto;
  carregando = false;
  processando = false;
  erro = '';

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.accommodation
      .reserva(this.id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (r) => (this.reserva = r),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a reserva.';
        },
      });
  }

  get souHospede(): boolean {
    return !!this.reserva && this.session.userId() === this.reserva.requester.id;
  }

  get souAnfitriao(): boolean {
    return !!this.reserva && this.session.userId() === this.reserva.provider.id;
  }

  get podeResponder(): boolean {
    return this.souAnfitriao && this.reserva?.status === 'Requested';
  }

  get podeCheckIn(): boolean {
    return this.souAnfitriao && this.reserva?.status === 'Confirmed';
  }

  get podeConcluir(): boolean {
    return this.souAnfitriao && this.reserva?.status === 'CheckedIn';
  }

  get podeCancelar(): boolean {
    const s = this.reserva?.status;
    return (
      (this.souHospede || this.souAnfitriao) &&
      (s === 'Requested' || s === 'Confirmed' || s === 'CheckedIn')
    );
  }

  confirmar() {
    this.executar(this.accommodation.responder(this.id, { status: 'Confirmed' }));
  }
  recusar() {
    this.executar(this.accommodation.responder(this.id, { status: 'Rejected' }));
  }
  checkIn() {
    this.executar(this.accommodation.checkIn(this.id));
  }
  concluir() {
    this.executar(this.accommodation.concluir(this.id));
  }
  cancelar() {
    this.executar(this.accommodation.cancelar(this.id));
  }

  private executar(obs: Observable<BookingDto>) {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    obs.pipe(finalize(() => (this.processando = false))).subscribe({
      next: (r) => (this.reserva = r),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar a reserva.';
      },
    });
  }

  abrirChat() {
    if (this.reserva) this.router.navigate(['/chat', this.reserva.chatRoomId]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor?: string): string {
    return this.accommodation.formatarPreco(valor ?? '0');
  }

  get statusLabel(): string {
    return this.reserva ? this.accommodation.statusLabel(this.reserva.status) : '';
  }
}
