import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { RentalService } from '../../../core/services/rental';
import { RentalDto } from '../../../core/models/rental';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-meus-alugueis',
  imports: [CommonModule],
  templateUrl: './meus-alugueis.html',
  styleUrl: './meus-alugueis.scss',
})
export class MeusAlugueisComponent implements OnInit {
  private readonly rental = inject(RentalService);
  private readonly router = inject(Router);

  alugueis: RentalDto[] = [];
  carregando = false;
  erro = '';

  ngOnInit() {
    this.carregando = true;
    this.rental
      .alugueis({ participantRole: 'All' })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (page) => (this.alugueis = page.items),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar os aluguéis.';
        },
      });
  }

  abrir(id: number) {
    this.router.navigate(['/aluguel', id]);
  }

  voltar() {
    history.back();
  }

  statusLabel(a: RentalDto): string {
    return this.rental.statusLabel(a.status);
  }

  formatarPreco(valor: string): string {
    return this.rental.formatarPreco(valor);
  }
}
