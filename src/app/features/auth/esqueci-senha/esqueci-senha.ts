import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ApiError } from '../../../core/models/common';
import { isValidBRPhone, maskBRPhone, phoneToE164 } from '../../../core/utils/phone';

/**
 * Solicita o código de redefinição — `POST /no-auth/forgot`.
 * Aceita e-mail OU telefone; com e-mail opcional, o **SMS é o caminho principal**.
 */
@Component({
  selector: 'app-esqueci-senha',
  imports: [CommonModule, FormsModule],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.scss',
})
export class EsqueciSenhaComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  identificador = '';
  erro = '';
  carregando = false;

  onIdentificadorInput(valor: string) {
    const t = (valor ?? '').trimStart();
    const pareceTelefone = /^[\d(+]/.test(t) && !t.includes('@');
    this.identificador = pareceTelefone ? maskBRPhone(t) : valor;
  }

  private get ehEmail(): boolean {
    return this.identificador.includes('@');
  }

  enviar() {
    this.erro = '';
    const v = this.identificador.trim();
    if (!v) {
      this.erro = 'Informe seu e-mail ou telefone.';
      return;
    }
    if (this.ehEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        this.erro = 'Informe um e-mail válido.';
        return;
      }
    } else if (!isValidBRPhone(v)) {
      this.erro = 'Informe um telefone válido com DDD.';
      return;
    }

    const channel: 'sms' | 'email' = this.ehEmail ? 'email' : 'sms';
    const identifier = this.ehEmail ? v : phoneToE164(v);

    this.carregando = true;
    this.auth.forgot({ channel, identifier }).subscribe({
      next: () => {
        this.carregando = false;
        // Carrega o `identifier` normalizado para a tela de redefinição.
        this.router.navigate(['/redefinir-senha'], { state: { identifier } });
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar o código. Tente novamente.';
      },
    });
  }

  voltarLogin() {
    this.router.navigate(['/login']);
  }
}
