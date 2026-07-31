import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { SessionService } from '../../../core/services/session';
import { ApiError } from '../../../core/models/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);

  email = '';
  senha = '';
  senhaVisivel = false;
  erro = '';
  carregando = false;

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  entrar() {
    this.erro = '';

    const email = this.email.trim();
    if (!email.includes('@')) {
      this.erro = 'Informe um email válido.';
      return;
    }
    if (this.senha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    this.carregando = true;
    this.auth.login({ email, password: this.senha }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigateByUrl(this.auth.homeRouteFor(this.session.profileType()));
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro =
          err?.status === 401
            ? 'Email ou senha inválidos.'
            : (err?.message ?? 'Não foi possível entrar. Tente novamente.');
      },
    });
  }

  cadastrar() {
    this.router.navigate(['/selecionar-perfil']);
  }

  esqueceuSenha() {
    this.router.navigate(['/esqueci-senha']);
  }
}
