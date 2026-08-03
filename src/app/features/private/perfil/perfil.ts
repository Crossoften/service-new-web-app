import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../core/services/profile';
import { AuthService } from '../../../core/services/auth';
import { SessionService } from '../../../core/services/session';
import { ApiError } from '../../../core/models/common';
import { BillingType } from '../../../core/models/enums';
import { ResponseProfileDto } from '../../../core/models/profile';

/**
 * Tela "Meu perfil": carrega `GET /profile/me`, edita dados/foto (`PATCH /profile/me`),
 * endereço (`PATCH /profile/me/address`) e — para fornecedor — o modelo de cobrança
 * (`PATCH /profile/me/billing-type`). Inclui logout.
 */
@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class PerfilComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);

  perfil: ResponseProfileDto | null = null;

  // Dados
  nome = '';
  email = '';
  telefone = '';
  documento = '';
  biografia = '';
  fileUrl?: string;
  fileKey?: string;

  // Endereço
  rua = '';
  numero = '';
  bairro = '';
  cidade = '';
  estado = '';
  cep = '';

  // Cobrança (fornecedor)
  billingType: BillingType = 'None';

  carregando = false;
  salvandoDados = false;
  salvandoEndereco = false;
  salvandoCobranca = false;
  erro = '';
  aviso = '';

  ngOnInit() {
    this.carregar();
  }

  get isSupplier(): boolean {
    return this.session.profileType() === 'Supplier';
  }

  carregar() {
    this.carregando = true;
    this.erro = '';
    this.profileService.me().subscribe({
      next: (p) => {
        this.carregando = false;
        this.aplicar(p);
      },
      error: (err: ApiError) => {
        this.carregando = false;
        this.erro = this.msg(err, 'Não foi possível carregar o perfil.');
      },
    });
  }

  private aplicar(p: ResponseProfileDto) {
    this.perfil = p;
    this.nome = p.name ?? '';
    this.email = p.email ?? '';
    this.telefone = p.phone ?? '';
    this.documento = p.document ?? '';
    this.biografia = p.biography ?? '';
    this.fileUrl = p.fileUrl;
    this.fileKey = p.fileKey;
    this.rua = p.address?.street ?? '';
    this.numero = p.address?.number ?? '';
    this.bairro = p.address?.neighborhood ?? '';
    this.cidade = p.address?.city ?? '';
    this.estado = p.address?.state ?? '';
    this.cep = p.address?.zipCode ?? '';
    this.billingType = p.billingType ?? 'None';
  }

  salvarDados() {
    if (!this.nome.trim()) {
      this.erro = 'Informe seu nome.';
      return;
    }
    this.erro = '';
    this.aviso = '';
    this.salvandoDados = true;
    this.profileService
      .update({
        name: this.nome.trim(),
        phone: this.telefone.trim() || undefined,
        document: this.documento.trim() || undefined,
        biography: this.biografia.trim() || undefined,
      })
      .subscribe({
        next: (p) => {
          this.salvandoDados = false;
          this.aplicar(p);
          this.aviso = 'Dados atualizados.';
        },
        error: (err: ApiError) => {
          this.salvandoDados = false;
          this.erro = this.msg(err, 'Não foi possível salvar os dados.');
        },
      });
  }

  salvarEndereco() {
    this.erro = '';
    this.aviso = '';
    this.salvandoEndereco = true;
    this.profileService
      .updateAddress({
        street: this.rua.trim() || undefined,
        number: this.numero.trim() || undefined,
        neighborhood: this.bairro.trim() || undefined,
        city: this.cidade.trim() || undefined,
        state: this.estado.trim() || undefined,
        zipCode: this.cep.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.salvandoEndereco = false;
          this.aviso = 'Endereço atualizado.';
        },
        error: (err: ApiError) => {
          this.salvandoEndereco = false;
          this.erro = this.msg(err, 'Não foi possível salvar o endereço.');
        },
      });
  }

  selecionarCobranca(tipo: BillingType) {
    if (this.billingType === tipo || this.salvandoCobranca) return;
    this.erro = '';
    this.aviso = '';
    this.salvandoCobranca = true;
    this.profileService.updateBillingType({ billingType: tipo }).subscribe({
      next: (p) => {
        this.salvandoCobranca = false;
        this.aplicar(p);
        this.aviso = 'Modelo de cobrança atualizado.';
      },
      error: (err: ApiError) => {
        this.salvandoCobranca = false;
        this.erro = this.msg(err, 'Não foi possível atualizar a cobrança.');
      },
    });
  }

  onFotoSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.erro = '';
    this.aviso = '';
    this.salvandoDados = true;
    this.profileService.uploadPhoto(file).subscribe({
      next: (up) => {
        this.profileService.update({ fileUrl: up.fileUrl, fileKey: up.fileKey }).subscribe({
          next: (p) => {
            this.salvandoDados = false;
            this.aplicar(p);
            this.aviso = 'Foto atualizada.';
          },
          error: (err: ApiError) => {
            this.salvandoDados = false;
            this.erro = this.msg(err, 'Não foi possível salvar a foto.');
          },
        });
      },
      error: (err: ApiError) => {
        this.salvandoDados = false;
        this.erro = this.msg(err, 'Não foi possível enviar a foto.');
      },
    });
    input.value = '';
  }

  removerFoto() {
    if (!this.fileUrl || this.salvandoDados) return;
    this.erro = '';
    this.aviso = '';
    this.salvandoDados = true;
    this.profileService.deletePhoto().subscribe({
      next: () => {
        this.salvandoDados = false;
        this.fileUrl = undefined;
        this.fileKey = undefined;
        this.aviso = 'Foto removida.';
      },
      error: (err: ApiError) => {
        this.salvandoDados = false;
        this.erro = this.msg(err, 'Não foi possível remover a foto.');
      },
    });
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  voltar() {
    history.back();
  }

  private msg(err: ApiError, fallback: string): string {
    return err?.message?.trim() ? err.message : fallback;
  }
}
