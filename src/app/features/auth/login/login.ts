import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { SessionService } from '../../../core/services/session';
import { ApiError } from '../../../core/models/common';
import { isValidBRPhone, maskBRPhone, phoneToE164 } from '../../../core/utils/phone';

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

  /** Aceita e-mail OU telefone (a API decide pelo `@`). */
  identificador = '';
  senha = '';
  senhaVisivel = false;
  erro = '';
  reenvioMsg = '';
  carregando = false;
  reenviando = false;

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  /** Aplica máscara de telefone só quando o texto não parece e-mail. */
  onIdentificadorInput(valor: string) {
    const t = (valor ?? '').trimStart();
    const pareceTelefone = /^[\d(+]/.test(t) && !t.includes('@');
    this.identificador = pareceTelefone ? maskBRPhone(t) : valor;
  }

  private get ehEmail(): boolean {
    return this.identificador.includes('@');
  }

  /** Valor a enviar: e-mail cru ou telefone normalizado para E.164. */
  private identificadorParaEnvio(): string {
    const v = this.identificador.trim();
    return this.ehEmail ? v : phoneToE164(v);
  }

  entrar() {
    this.erro = '';
    this.reenvioMsg = '';

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
    if (this.senha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    this.carregando = true;
    this.auth.login({ email: this.identificadorParaEnvio(), password: this.senha }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigateByUrl(this.auth.homeRouteFor(this.session.profileType()));
      },
      error: (err: ApiError) => {
        this.carregando = false;
        // A API responde `401` genérico para senha errada, usuário inexistente
        // E conta `Pending` (não verificada) — não dá para distinguir. Por isso
        // oferecemos sempre o reenvio do código como saída.
        this.erro =
          err?.status === 401
            ? 'Acesso não autorizado. Confira e-mail/telefone e senha.'
            : (err?.message ?? 'Não foi possível entrar. Tente novamente.');
      },
    });
  }

  /** "Não recebeu o código?" — reenvia o SMS de verificação (seguro para todos). */
  reenviarCodigo() {
    this.erro = '';
    this.reenvioMsg = '';
    const v = this.identificador.trim();
    if (!v || (!this.ehEmail && !isValidBRPhone(v))) {
      this.erro = 'Informe seu e-mail ou telefone acima para reenviar o código.';
      return;
    }
    this.reenviando = true;
    this.auth.resendVerification({ identifier: this.identificadorParaEnvio() }).subscribe({
      next: () => {
        this.reenviando = false;
        this.reenvioMsg = 'Se a conta estiver pendente, você receberá um novo SMS com o código.';
      },
      error: (err: ApiError) => {
        this.reenviando = false;
        this.reenvioMsg = 'Se a conta estiver pendente, você receberá um novo SMS com o código.';
        void err;
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
