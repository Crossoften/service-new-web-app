import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { SocialNetwork } from '../../../core/models/enums';
import { CreateUserSocialMediaDto, Perfil, RegisterBaseDto } from '../../../core/models/auth';
import { ApiError } from '../../../core/models/common';
import { isValidBRPhone, maskBRPhone, phoneToE164 } from '../../../core/utils/phone';

/**
 * Cadastro por perfil, integrado à API.
 * Fluxo: Dados → Senha → register (conta nasce `Pending` + SMS) → Verificação (SMS) → Sucesso → Login.
 *
 * Telefone é a identidade principal (obrigatório, enviado em E.164). E-mail é opcional.
 * A verificação de conta usa `verify-account` (código de 6 dígitos por SMS) — distinta da
 * recuperação de senha. A assinatura do fornecedor segue como onboarding pós-login.
 */
@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class CadastroComponent implements OnInit, OnDestroy {
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
  referralCode = ''; // → referralCode (via link de indicação `?ref=`)
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

  // Step 3 — Verificação (SMS)
  codigoVerificacao = '';
  /** Um dígito por caixa do input OTP (6 posições). */
  digitos: string[] = ['', '', '', '', '', ''];
  /** Telefone (E.164) da conta recém-criada — identifier para verify/resend. */
  identifier = '';
  reenvioSegundos = 0;
  reenvioMsg = '';
  private timer?: ReturnType<typeof setInterval>;

  @ViewChildren('otp') private otpInputs?: QueryList<ElementRef<HTMLInputElement>>;

  erro = '';
  carregando = false;

  ngOnInit() {
    this.perfil = (this.route.snapshot.paramMap.get('perfil') ?? 'cliente') as Perfil;
    // Link de indicação: `/cadastro/:perfil?ref=CODIGO` → preenche o referralCode.
    this.referralCode = this.route.snapshot.queryParamMap.get('ref')?.trim() ?? '';
  }

  ngOnDestroy() {
    this.pararContador();
  }

  get tituloPasso(): string {
    return 'CADASTRO';
  }

  formatarTelefone(event: Event) {
    this.telefone = maskBRPhone((event.target as HTMLInputElement).value);
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
      // E-mail é opcional; valida apenas se preenchido.
      const email = this.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.erro = 'Informe um e-mail válido ou deixe o campo em branco.';
        return;
      }
      if (!isValidBRPhone(this.telefone)) {
        this.erro = 'Informe um telefone válido com DDD.';
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
      if (this.senha.length > 32) {
        this.erro = 'A senha deve ter no máximo 32 caracteres.';
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
      this.verificarConta();
      return;
    }
  }

  // ── Integração ────────────────────────────────────────────────────────────

  private submitCadastro() {
    this.carregando = true;
    this.auth.register(this.perfil, this.buildRegisterDto()).subscribe({
      next: () => {
        this.carregando = false;
        // Conta criada em `Pending` + SMS enviado → etapa de verificação.
        this.identifier = phoneToE164(this.telefone);
        this.limparCodigo();
        this.step = 3;
        this.iniciarContador();
      },
      error: (err: ApiError) => {
        this.carregando = false;
        if (err?.status === 503) {
          // SMS não pôde ser enviado → NADA foi criado. Pode repetir sem risco de 409.
          this.erro = 'Não foi possível enviar o SMS agora. Tente novamente.';
          return;
        }
        if (err?.status === 409) {
          // Genérico de propósito — não revelar se colidiu telefone ou e-mail.
          this.erro = 'Já existe uma conta com os dados informados.';
          return;
        }
        this.erro = this.msg(err, 'Não foi possível concluir o cadastro.');
      },
    });
  }

  // ── Input OTP (código segmentado) ─────────────────────────────────────────

  onOtpInput(event: Event, i: number) {
    const input = event.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '');
    this.digitos[i] = v ? v[v.length - 1] : '';
    input.value = this.digitos[i];
    this.codigoVerificacao = this.digitos.join('');
    if (this.digitos[i] && i < 5) this.focarDigito(i + 1);
  }

  onOtpKeydown(event: KeyboardEvent, i: number) {
    if (event.key === 'Backspace' && !this.digitos[i] && i > 0) {
      this.focarDigito(i - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const texto = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    if (!texto) return;
    for (let i = 0; i < 6; i++) this.digitos[i] = texto[i] ?? '';
    this.codigoVerificacao = this.digitos.join('');
    this.focarDigito(Math.min(texto.length, 5));
  }

  private focarDigito(i: number) {
    this.otpInputs?.toArray()[i]?.nativeElement.focus();
  }

  private limparCodigo() {
    this.digitos = ['', '', '', '', '', ''];
    this.codigoVerificacao = '';
  }

  /** Confirma a conta com o código de 6 dígitos recebido por SMS — `verify-account`. */
  private verificarConta() {
    const code = this.codigoVerificacao.trim();
    if (!/^\d{6}$/.test(code)) {
      this.erro = 'Informe o código de 6 dígitos recebido por SMS.';
      return;
    }
    this.carregando = true;
    this.auth.verifyAccount({ identifier: this.identifier, code }).subscribe({
      next: () => {
        this.carregando = false;
        this.pararContador();
        this.router.navigate(['/cadastro/sucesso']);
      },
      error: (err: ApiError) => {
        this.carregando = false;
        // `404` é sempre a mesma mensagem (código errado/expirado/já usado/conta já verificada).
        this.erro = this.msg(err, 'Usuário ou código inválido.');
      },
    });
  }

  /** Reenvia o SMS de verificação (invalida o código anterior). */
  reenviarCodigo() {
    if (this.reenvioSegundos > 0 || !this.identifier) return;
    this.reenvioMsg = '';
    this.auth.resendVerification({ identifier: this.identifier }).subscribe({
      next: () => {
        this.limparCodigo();
        this.reenvioMsg = 'Novo SMS enviado. O código anterior deixa de valer.';
        this.iniciarContador();
      },
      error: (err: ApiError) => {
        this.reenvioMsg = 'Se a conta estiver pendente, você receberá um novo SMS.';
        this.iniciarContador();
        void err;
      },
    });
  }

  private iniciarContador(segundos = 60) {
    this.pararContador();
    this.reenvioSegundos = segundos;
    this.timer = setInterval(() => {
      this.reenvioSegundos -= 1;
      if (this.reenvioSegundos <= 0) this.pararContador();
    }, 1000);
  }

  private pararContador() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.reenvioSegundos = 0;
  }

  private buildRegisterDto(): RegisterBaseDto {
    const dto: RegisterBaseDto = {
      name: this.nome.trim(),
      phone: phoneToE164(this.telefone),
      password: this.senha,
      confirmPassword: this.confirmarSenha,
      acceptedTerms: this.termosAceitos,
    };
    const email = this.email.trim();
    if (email) dto.email = email; // e-mail é opcional — omitido quando em branco.
    const invite = this.codigo.trim();
    if (invite) dto.inviteCode = invite;
    const referral = this.referralCode.trim();
    if (referral) dto.referralCode = referral;
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
