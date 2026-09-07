import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MercadoPagoService } from '../../../../core/services/mercado-pago';
import { MercadoPagoStatusDto } from '../../../../core/models/mercado-pago';
import { ApiError } from '../../../../core/models/common';

/**
 * Vínculo da conta do Mercado Pago do fornecedor.
 * `status` decide entre o botão "conectar" e o selo "conectado".
 */
@Component({
  selector: 'app-mercado-pago-fornecedor',
  imports: [CommonModule],
  templateUrl: './mercado-pago-fornecedor.html',
  styleUrl: './mercado-pago-fornecedor.scss',
})
export class MercadoPagoFornecedorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly mp = inject(MercadoPagoService);

  status?: MercadoPagoStatusDto;
  carregando = false;
  conectando = false;
  erro = '';

  ngOnInit() {
    this.carregarStatus();
  }

  carregarStatus() {
    this.carregando = true;
    this.erro = '';
    this.mp
      .status()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (s) => (this.status = s),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível verificar o vínculo.';
        },
      });
  }

  conectar() {
    if (this.conectando) return;
    this.conectando = true;
    this.erro = '';
    this.mp.connectUrl(this.mp.redirectUri()).subscribe({
      next: (res) => {
        // Leva o fornecedor ao Mercado Pago para autorizar. O retorno cai na rota de callback.
        window.location.href = res.url;
      },
      error: (err: ApiError) => {
        this.conectando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível iniciar a conexão.';
      },
    });
  }

  voltar() {
    this.router.navigate(['/fornecedor']);
  }
}
