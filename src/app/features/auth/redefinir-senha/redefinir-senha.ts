import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ApiError } from '../../../core/models/common';
import { displayBRPhone } from '../../../core/utils/phone';

/** Redefine a senha a partir do código de 6 dígitos — `POST /no-auth/reset`. */
@Component({
  selector: 'app-redefinir-senha',
  imports: [CommonModule, FormsModule],
  templateUrl: './redefinir-senha.html',
  styleUrl: './redefinir-senha.scss',
})
export class RedefinirSenhaComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** `identifier` (e-mail ou telefone E.164) carregado da tela anterior. */
  identifier: string = (history.state?.identifier as string) ?? '';
  codigo = '';
  senha = '';
  confirmarSenha = '';
  senhaVisivel = false;
  confirmarSenhaVisivel = false;
  erro = '';
  carregando = false;

  /** Exibição amigável do destino (telefone mascarado ou e-mail). */
  get destinoExibicao(): string {
    if (!this.identifier) return '';
    return this.identifier.includes('@') ? this.identifier : displayBRPhone(this.identifier);
  }

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  toggleConfirmarSenha() {
    this.confirmarSenhaVisivel = !this.confirmarSenhaVisivel;
  }

  redefinir() {
    this.erro = '';
    if (!this.identifier) {
      this.erro = 'Sessão de recuperação expirada. Solicite o código novamente.';
      return;
    }
    const code = this.codigo.trim();
    if (!/^\d{6}$/.test(code)) {
      this.erro = 'Informe o código de 6 dígitos.';
      return;
    }
    if (this.senha.length < 8) {
      this.erro = 'A senha deve ter no mínimo 8 caracteres.';
      return;
    }
    if (this.senha.length > 32) {
      this.erro = 'A senha deve ter no máximo 32 caracteres.';
      return;
    }
    if (this.senha !== this.confirmarSenha) {
      this.erro = 'As senhas não conferem.';
      return;
    }
    this.carregando = true;
    this.auth
      .reset({
        identifier: this.identifier,
        code,
        password: this.senha,
        confirmPassword: this.confirmarSenha,
      })
      .subscribe({
        next: () => {
          this.carregando = false;
          this.router.navigate(['/login']);
        },
        error: (err: ApiError) => {
          this.carregando = false;
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível redefinir a senha. Verifique o código.';
        },
      });
  }

  reenviarCodigo() {
    this.router.navigate(['/esqueci-senha']);
  }
}
