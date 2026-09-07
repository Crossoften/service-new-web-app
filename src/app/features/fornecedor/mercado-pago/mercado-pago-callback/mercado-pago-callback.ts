import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { MercadoPagoService } from '../../../../core/services/mercado-pago';
import { ApiError } from '../../../../core/models/common';

/**
 * Retorno do OAuth do Mercado Pago. Recebe o `code` na query, troca pelo vínculo
 * e volta para a tela de conta de recebimento.
 */
@Component({
  selector: 'app-mercado-pago-callback',
  imports: [CommonModule],
  templateUrl: './mercado-pago-callback.html',
  styleUrl: './mercado-pago-callback.scss',
})
export class MercadoPagoCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mp = inject(MercadoPagoService);

  processando = true;
  erro = '';

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');

    if (!code) {
      // O usuário recusou a autorização ou o Mercado Pago não devolveu o código.
      this.processando = false;
      this.erro = 'Autorização não concluída. Tente conectar novamente.';
      return;
    }

    this.mp
      .vincular({ code, redirectUri: this.mp.redirectUri() })
      .pipe(finalize(() => (this.processando = false)))
      .subscribe({
        next: () => this.router.navigate(['/fornecedor/mercado-pago']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível concluir a conexão.';
        },
      });
  }

  tentarNovamente() {
    this.router.navigate(['/fornecedor/mercado-pago']);
  }
}
