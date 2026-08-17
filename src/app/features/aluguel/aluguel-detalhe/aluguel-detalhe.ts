import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { RentalService } from '../../../core/services/rental';
import { SessionService } from '../../../core/services/session';
import { RentalDto } from '../../../core/models/rental';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-aluguel-detalhe',
  imports: [CommonModule],
  templateUrl: './aluguel-detalhe.html',
  styleUrl: './aluguel-detalhe.scss',
})
export class AluguelDetalheComponent implements OnInit {
  private readonly rental = inject(RentalService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id = 0;
  aluguel?: RentalDto;
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
    this.rental
      .aluguel(this.id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (a) => (this.aluguel = a),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o aluguel.';
        },
      });
  }

  get souLocatario(): boolean {
    return !!this.aluguel && this.session.userId() === this.aluguel.requester.id;
  }

  get souLocador(): boolean {
    return !!this.aluguel && this.session.userId() === this.aluguel.provider.id;
  }

  get podeResponder(): boolean {
    return this.souLocador && this.aluguel?.status === 'Requested';
  }

  get podeIniciar(): boolean {
    return this.souLocador && this.aluguel?.status === 'Accepted';
  }

  get podeDevolver(): boolean {
    return this.souLocador && this.aluguel?.status === 'Active';
  }

  get podeCancelar(): boolean {
    const s = this.aluguel?.status;
    return (
      (this.souLocatario || this.souLocador) &&
      (s === 'Requested' || s === 'Accepted' || s === 'Active')
    );
  }

  aceitar() {
    this.executar(this.rental.responder(this.id, { status: 'Accepted' }));
  }
  recusar() {
    this.executar(this.rental.responder(this.id, { status: 'Rejected' }));
  }
  iniciar() {
    this.executar(this.rental.iniciar(this.id));
  }
  devolver() {
    this.executar(this.rental.devolver(this.id));
  }
  cancelar() {
    this.executar(this.rental.cancelar(this.id));
  }

  private executar(obs: Observable<RentalDto>) {
    if (this.processando) return;
    this.processando = true;
    this.erro = '';
    obs.pipe(finalize(() => (this.processando = false))).subscribe({
      next: (a) => (this.aluguel = a),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível atualizar o aluguel.';
      },
    });
  }

  abrirChat() {
    if (this.aluguel) this.router.navigate(['/chat', this.aluguel.chatRoomId]);
  }

  voltar() {
    history.back();
  }

  formatarPreco(valor?: string): string {
    return this.rental.formatarPreco(valor ?? '0');
  }

  get statusLabel(): string {
    return this.aluguel ? this.rental.statusLabel(this.aluguel.status) : '';
  }
}
