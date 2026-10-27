import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Coordenadas,
  EnderecoMapa,
  MapaEnderecoComponent,
} from '../../../shared/components/mapa-endereco/mapa-endereco';
import { ProfileService } from '../../../core/services/profile';
import { CepService } from '../../../core/services/cep';
import { AuthService } from '../../../core/services/auth';
import { SessionService } from '../../../core/services/session';
import { PushService } from '../../../core/services/push';
import { ApiError } from '../../../core/models/common';
import { ResponseProfileDto } from '../../../core/models/profile';

/**
 * Tela "Meu perfil": carrega `GET /profile/me`, edita dados/foto (`PATCH /profile/me`)
 * e endereço (`PATCH /profile/me/address`). Inclui logout. O modelo de cobrança não é
 * escolha do fornecedor — definido pelo back —, então não aparece aqui.
 */
@Component({
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule, MapaEnderecoComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class PerfilComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly cepService = inject(CepService);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly push = inject(PushService);

  perfil: ResponseProfileDto | null = null;

  // Notificações push (§8.10)
  notificacoesAtivas = false;
  ativandoPush = false;
  pushMsg = '';

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
  cepBuscando = false;
  cepErro = '';
  // Coordenadas do endereço (Fase 8.4) — capturadas via mapa (MAP-2); aqui preservadas.
  latitude?: string;
  longitude?: string;

  carregando = false;
  salvandoDados = false;
  salvandoEndereco = false;
  erro = '';
  aviso = '';

  // Modo edição por seção (padrão: só leitura).
  editandoDados = false;
  editandoEndereco = false;

  ngOnInit() {
    this.carregar();
    // Dica inicial: ler a permissão NÃO dispara o prompt (§8.10).
    try {
      this.notificacoesAtivas =
        typeof Notification !== 'undefined' && Notification.permission === 'granted';
    } catch {
      this.notificacoesAtivas = false;
    }
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
    this.latitude = p.address?.latitude;
    this.longitude = p.address?.longitude;
  }

  editarDados() {
    this.erro = '';
    this.aviso = '';
    this.editandoDados = true;
  }

  cancelarDados() {
    if (this.perfil) this.aplicar(this.perfil);
    this.erro = '';
    this.editandoDados = false;
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
          this.editandoDados = false;
          this.aviso = 'Dados atualizados.';
        },
        error: (err: ApiError) => {
          this.salvandoDados = false;
          this.erro = this.msg(err, 'Não foi possível salvar os dados.');
        },
      });
  }

  editarEndereco() {
    this.erro = '';
    this.aviso = '';
    this.editandoEndereco = true;
  }

  onCoordenadas(c: Coordenadas) {
    this.latitude = c.latitude;
    this.longitude = c.longitude;
  }

  /** Preenche os campos de endereço a partir do resultado do Maps (§3.2). */
  onEnderecoMapa(e: EnderecoMapa) {
    if (!this.editandoEndereco) return;
    if (e.street) this.rua = e.street;
    if (e.number) this.numero = e.number;
    if (e.neighborhood) this.bairro = e.neighborhood;
    if (e.city) this.cidade = e.city;
    if (e.state) this.estado = e.state;
    if (e.zipCode) this.cep = e.zipCode;
  }

  /** Preenche rua/bairro/cidade/UF a partir do CEP (ViaCEP), no blur do campo. */
  buscarCep() {
    if (!this.editandoEndereco) return;
    const digitos = this.cep.replace(/\D/g, '');
    if (digitos.length !== 8 || this.cepBuscando) return;
    this.cepBuscando = true;
    this.cepErro = '';
    this.cepService
      .buscar(this.cep)
      .then((end) => {
        if (!end) {
          this.cepErro = 'CEP não encontrado. Preencha o endereço manualmente.';
          return;
        }
        if (end.street) this.rua = end.street;
        if (end.neighborhood) this.bairro = end.neighborhood;
        if (end.city) this.cidade = end.city;
        if (end.state) this.estado = end.state;
      })
      .catch(() => {
        this.cepErro = 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.';
      })
      .finally(() => (this.cepBuscando = false));
  }

  cancelarEndereco() {
    if (this.perfil) this.aplicar(this.perfil);
    this.erro = '';
    this.editandoEndereco = false;
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
        // Preserva as coordenadas já existentes (a captura via mapa entra no MAP-2).
        latitude: this.latitude || undefined,
        longitude: this.longitude || undefined,
      })
      .subscribe({
        next: () => {
          this.salvandoEndereco = false;
          this.editandoEndereco = false;
          this.aviso = 'Endereço atualizado.';
        },
        error: (err: ApiError) => {
          this.salvandoEndereco = false;
          this.erro = this.msg(err, 'Não foi possível salvar o endereço.');
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
    if (!this.fileUrl || !this.fileKey || this.salvandoDados) return;
    this.erro = '';
    this.aviso = '';
    this.salvandoDados = true;
    this.profileService.deletePhoto(this.fileKey).subscribe({
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

  /** Ativa push a partir do clique (gesto do usuário) — §8.10. */
  async ativarNotificacoes() {
    if (this.ativandoPush) return;
    this.ativandoPush = true;
    this.pushMsg = '';
    const r = await this.push.ativar();
    this.ativandoPush = false;
    switch (r) {
      case 'ativado':
        this.notificacoesAtivas = true;
        this.pushMsg = 'Notificações ativadas.';
        break;
      case 'sem-vapid':
        // publicKey null: não pedimos permissão. Apenas informa.
        this.pushMsg = 'Notificações ainda não disponíveis (em configuração no servidor).';
        break;
      case 'indisponivel':
        this.pushMsg = 'Notificações não são suportadas neste ambiente.';
        break;
      case 'negado':
        this.pushMsg = 'Permissão de notificações negada.';
        break;
    }
  }

  async sair() {
    // Cancela a inscrição push antes de encerrar a sessão (§8.10).
    await this.push.desativar().catch(() => undefined);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  irContaRecebimento() {
    this.router.navigate(['/fornecedor/mercado-pago']);
  }

  voltar() {
    history.back();
  }

  private msg(err: ApiError, fallback: string): string {
    return err?.message?.trim() ? err.message : fallback;
  }
}
