import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { SocialNetwork } from '../../../core/models/enums';
import { CreateUserSocialMediaDto, Perfil, RegisterBaseDto } from '../../../core/models/auth';
import { ApiError } from '../../../core/models/common';

/**
 * Fluxo de cadastro por perfil, integrado à API.
 * Todos os perfis: Dados → Senha → register → Sucesso → Login.
 *
 * A assinatura do fornecedor (planos/`subscriptions`) foi movida para um passo
 * **pós-login** (onboarding), evitando login automático frágil no cadastro.
 * (A etapa de SMS não existe no web — o verify-code é exclusivo do mobile.)
 */
@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class CadastroComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  perfil: Perfil = 'cliente';
  step = 1;

  // Step 1 — Dados
  nome = '';
  email = '';
  telefone = '';
  codigo = ''; // → inviteCode (opcional)
  termosAceitos = false;

  // Step 1 — Parceiro (redes sociais)
  instagram = '';
  facebook = '';
  youtube = '';
  twitter = '';
  site = '';

  // Step 2 — Senha
  senha = '';
  confirmarSenha = '';
  senhaVisivel = false;
  confirmarSenhaVisivel = false;

  // Step 3 — Código de verificação (verify-code, enviado por email)
  codigoVerificacao = '';

  erro = '';
  carregando = false;

  ngOnInit() {
    this.perfil = (this.route.snapshot.paramMap.get('perfil') ?? 'cliente') as Perfil;
  }

  get tituloPasso(): string {
    return 'CADASTRO';
  }

  formatarTelefone(event: Event) {
    let valor = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 6) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }
    this.telefone = valor;
  }

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  toggleConfirmarSenha() {
    this.confirmarSenhaVisivel = !this.confirmarSenhaVisivel;
  }

  voltar() {
    if (this.carregando) return;
    if (this.step > 1) {
      this.step--;
    } else {
      history.back();
    }
  }

  continuar() {
    if (this.carregando) return;
    this.erro = '';

    if (this.step === 1) {
      if (!this.nome.trim()) {
        this.erro = 'Informe seu nome.';
        return;
      }
      if (!this.email.trim().includes('@')) {
        this.erro = 'Informe um email válido.';
        return;
      }
      const phone = this.telefone.replace(/\D/g, '');
      if (phone.length < 10 || phone.length > 11) {
        this.erro = 'Informe um telefone válido no formato brasileiro.';
        return;
      }
      if (!this.termosAceitos) {
        this.erro = 'Aceite os termos para continuar.';
        return;
      }
      this.step = 2;
      return;
    }

    if (this.step === 2) {
      if (this.senha.length < 8) {
        this.erro = 'A senha deve ter no mínimo 8 caracteres.';
        return;
      }
      if (this.senha !== this.confirmarSenha) {
        this.erro = 'As senhas não conferem.';
        return;
      }
      this.submitCadastro();
      return;
    }

    if (this.step === 3) {
      this.verificarCodigo();
      return;
    }
  }

  // ── Integração ────────────────────────────────────────────────────────────

  private submitCadastro() {
    this.carregando = true;
    this.auth.register(this.perfil, this.buildRegisterDto()).subscribe({
      next: () => {
        this.carregando = false;
        // Conta criada (status Pending) + código enviado por email → etapa de verificação.
        this.step = 3;
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = this.msg(err, 'Não foi possível concluir o cadastro.');
      },
    });
  }

  /** Confirma a conta com o código recebido por email — `POST /no-auth/verify-code`. */
  private verificarCodigo() {
    const code = this.codigoVerificacao.trim();
    if (!code) {
      this.erro = 'Informe o código enviado ao seu email.';
      return;
    }
    this.carregando = true;
    this.auth.verifyCode({ code }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/cadastro/sucesso']);
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = this.msg(err, 'Código inválido. Verifique e tente novamente.');
      },
    });
  }

  private buildRegisterDto(): RegisterBaseDto {
    const dto: RegisterBaseDto = {
      name: this.nome.trim(),
      email: this.email.trim(),
      password: this.senha,
      confirmPassword: this.confirmarSenha,
      acceptedTerms: this.termosAceitos,
    };
    const phone = this.telefone.replace(/\D/g, '');
    if (phone) dto.phone = phone;
    const invite = this.codigo.trim();
    if (invite) dto.inviteCode = invite;
    if (this.perfil === 'parceiro') {
      const socialMedias = this.buildSocialMedias();
      if (socialMedias.length) dto.socialMedias = socialMedias;
    }
    return dto;
  }

  private buildSocialMedias(): CreateUserSocialMediaDto[] {
    const fontes: { url: string; network: SocialNetwork }[] = [
      { url: this.instagram, network: 'Instagram' },
      { url: this.facebook, network: 'Facebook' },
      { url: this.youtube, network: 'YouTube' },
      { url: this.twitter, network: 'X' },
      { url: this.site, network: 'Other' },
    ];
    return fontes
      .filter((f) => f.url.trim())
      .map((f) => ({ network: f.network, url: f.url.trim() }));
  }

  private msg(err: ApiError, fallback: string): string {
    return err?.message?.trim() ? err.message : fallback;
  }
}
