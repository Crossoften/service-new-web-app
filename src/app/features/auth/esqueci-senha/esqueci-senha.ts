import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ApiError } from '../../../core/models/common';

/** Solicita o código de redefinição por email — `POST /no-auth/forgot`. */
@Component({
  selector: 'app-esqueci-senha',
  imports: [CommonModule, FormsModule],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.scss',
})
export class EsqueciSenhaComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  email = '';
  erro = '';
  carregando = false;

  enviar() {
    this.erro = '';
    const email = this.email.trim();
    if (!email.includes('@')) {
      this.erro = 'Informe um email válido.';
      return;
    }
    this.carregando = true;
    this.auth.forgot({ email }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/redefinir-senha'], { state: { email } });
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
