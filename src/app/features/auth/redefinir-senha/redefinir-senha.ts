import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { ApiError } from '../../../core/models/common';

/** Redefine a senha a partir do código recebido por email — `POST /no-auth/reset`. */
@Component({
  selector: 'app-redefinir-senha',
  imports: [CommonModule, FormsModule],
  templateUrl: './redefinir-senha.html',
  styleUrl: './redefinir-senha.scss',
})
export class RedefinirSenhaComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  codigo = '';
  senha = '';
  confirmarSenha = '';
  senhaVisivel = false;
  confirmarSenhaVisivel = false;
  erro = '';
  carregando = false;

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  toggleConfirmarSenha() {
    this.confirmarSenhaVisivel = !this.confirmarSenhaVisivel;
  }

  redefinir() {
    this.erro = '';
    const code = this.codigo.trim();
    if (code.length !== 4) {
      this.erro = 'Informe o código de 4 dígitos.';
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
    this.auth.reset({ code, password: this.senha, confirmPassword: this.confirmarSenha }).subscribe({
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
