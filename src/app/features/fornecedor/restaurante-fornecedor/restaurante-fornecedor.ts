import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
import { FornecedorService } from '../../../core/services/fornecedor';
import { DeliveryService } from '../../../core/services/delivery';
import { CepService } from '../../../core/services/cep';
import { ApiService } from '../../../core/services/api';
import {
  RestaurantAddressDto,
  ResponseRestaurantCategoryDto,
  ResponseRestaurantDto,
} from '../../../core/models/restaurant';
import { ApiError } from '../../../core/models/common';
import {
  Coordenadas,
  EnderecoMapa,
  MapaEnderecoComponent,
} from '../../../shared/components/mapa-endereco/mapa-endereco';

/**
 * Cadastro/edição do restaurante do fornecedor (onboarding).
 * Cria via `POST /restaurants` ou edita via `PATCH /restaurants/{id}` (inclui abrir/fechar).
 */
@Component({
  selector: 'app-restaurante-fornecedor',
  imports: [CommonModule, FormsModule, MapaEnderecoComponent],
  templateUrl: './restaurante-fornecedor.html',
  styleUrl: './restaurante-fornecedor.scss',
})
export class RestauranteFornecedorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fornecedorService = inject(FornecedorService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly cepService = inject(CepService);
  private readonly api = inject(ApiService);

  restaurante: ResponseRestaurantDto | null = null;
  categorias: ResponseRestaurantCategoryDto[] = [];

  nome = '';
  descricao = '';
  imageUrl = '';
  imageKey = '';
  enviandoFoto = false;
  categoriaId: number | null = null;
  categoriaAberta = false;
  aberto = true;
  tempoMin?: number;
  tempoMax?: number;

  // Endereço do estabelecimento (Fase 8.4)
  ruaEnd = '';
  numeroEnd = '';
  bairroEnd = '';
  cidadeEnd = '';
  estadoEnd = '';
  cepEnd = '';
  latEnd?: string;
  lngEnd?: string;
  cepBuscando = false;
  cepErro = '';

  carregando = false;
  carregandoCategorias = false;
  erroCategorias = false;
  salvando = false;
  erro = '';
  aviso = '';
  precisaAssinatura = false;

  // Maquininha própria (§8.6)
  usaMaquininha = false;
  mostrandoTermoMaquininha = false;
  aceitouResponsabilidade = false;
  salvandoMaquininha = false;
  erroMaquininha = '';

  get modoEdicao(): boolean {
    return this.restaurante !== null;
  }

  ngOnInit() {
    this.carregarCategorias();
    this.carregarRestaurante();
  }

  /** Carrega as categorias de restaurante (com timeout e opção de retry). */
  carregarCategorias() {
    this.carregandoCategorias = true;
    this.erroCategorias = false;
    this.deliveryService
      .getCategorias()
      .pipe(
        timeout(10000),
        finalize(() => (this.carregandoCategorias = false)),
      )
      .subscribe({
        next: (cats) => {
          this.categorias = cats ?? [];
          if (this.categoriaId == null && this.categorias.length) {
            this.categoriaId = this.categorias[0].id;
          }
          this.erroCategorias = this.categorias.length === 0;
        },
        error: () => (this.erroCategorias = true),
      });
  }

  private carregarRestaurante() {
    this.carregando = true;
    this.fornecedorService
      .meuRestaurante()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (r) => {
          if (r) this.aplicar(r);
        },
        error: () => {},
    });
  }

  private aplicar(r: ResponseRestaurantDto) {
    this.restaurante = r;
    this.nome = r.name;
    this.descricao = r.description ?? '';
    this.imageUrl = r.imageUrl ?? '';
    this.categoriaId = r.category?.id ?? this.categoriaId;
    this.aberto = r.isOpen;
    this.tempoMin = r.deliveryTimeMinMinutes;
    this.tempoMax = r.deliveryTimeMaxMinutes;
    this.ruaEnd = r.address?.street ?? '';
    this.numeroEnd = r.address?.number ?? '';
    this.bairroEnd = r.address?.neighborhood ?? '';
    this.cidadeEnd = r.address?.city ?? '';
    this.estadoEnd = r.address?.state ?? '';
    this.cepEnd = r.address?.zipCode ?? '';
    this.latEnd = r.address?.latitude;
    this.lngEnd = r.address?.longitude;
    this.usaMaquininha = r.usesOwnCardMachine ?? false;
  }

  // ── Maquininha própria (§8.6) ───────────────────────────────────────────────

  /** Abre o termo antes de ligar (o back grava quem aceitou, quando e a versão do texto). */
  abrirTermoMaquininha() {
    this.mostrandoTermoMaquininha = true;
    this.aceitouResponsabilidade = false;
    this.erroMaquininha = '';
  }

  cancelarTermoMaquininha() {
    this.mostrandoTermoMaquininha = false;
    this.aceitouResponsabilidade = false;
  }

  /** Liga a maquininha — exige o aceite do termo (`acceptResponsibility: true`). */
  confirmarLigarMaquininha() {
    if (!this.aceitouResponsabilidade || this.salvandoMaquininha) return;
    this.enviarMaquininha(true, true);
  }

  /** Desliga a maquininha — não exige aceite; limpa o registro no back. */
  desligarMaquininha() {
    if (this.salvandoMaquininha) return;
    this.enviarMaquininha(false, false);
  }

  private enviarMaquininha(usesOwnCardMachine: boolean, acceptResponsibility: boolean) {
    this.salvandoMaquininha = true;
    this.erroMaquininha = '';
    this.fornecedorService
      .atualizarMaquininha({ usesOwnCardMachine, acceptResponsibility })
      .pipe(finalize(() => (this.salvandoMaquininha = false)))
      .subscribe({
        next: (r) => {
          if (this.restaurante) this.restaurante.usesOwnCardMachine = r.usesOwnCardMachine;
          this.usaMaquininha = r.usesOwnCardMachine ?? usesOwnCardMachine;
          this.mostrandoTermoMaquininha = false;
          this.aceitouResponsabilidade = false;
        },
        error: (err: ApiError) => {
          this.erroMaquininha = err?.message?.trim() ? err.message : 'Não foi possível atualizar a maquininha.';
        },
      });
  }

  onCoordenadas(c: Coordenadas) {
    this.latEnd = c.latitude;
    this.lngEnd = c.longitude;
  }

  /** Upload da foto do restaurante — `POST /upload/one-file` (HEIC→JPEG no ApiService). */
  selecionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.enviandoFoto = true;
    this.erro = '';
    this.api
      .uploadOne(file)
      .pipe(finalize(() => (this.enviandoFoto = false)))
      .subscribe({
        next: (res) => {
          this.imageUrl = res.fileUrl;
          this.imageKey = res.fileKey;
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a imagem.';
        },
      });
  }

  /** Preenche os campos de endereço a partir do resultado do Maps (§3.2). */
  onEnderecoMapa(e: EnderecoMapa) {
    if (e.street) this.ruaEnd = e.street;
    if (e.number) this.numeroEnd = e.number;
    if (e.neighborhood) this.bairroEnd = e.neighborhood;
    if (e.city) this.cidadeEnd = e.city;
    if (e.state) this.estadoEnd = e.state;
    if (e.zipCode) this.cepEnd = e.zipCode;
  }

  /**
   * Preenche rua/bairro/cidade/UF a partir do CEP (ViaCEP), no blur do campo.
   * Mantém número e complemento para preenchimento manual (§3.1). CEP incompleto
   * não faz nada; CEP inexistente ou serviço fora avisa sem bloquear o cadastro.
   */
  buscarCep() {
    const digitos = this.cepEnd.replace(/\D/g, '');
    if (digitos.length !== 8 || this.cepBuscando) return;
    this.cepBuscando = true;
    this.cepErro = '';
    this.cepService
      .buscar(this.cepEnd)
      .then((end) => {
        if (!end) {
          this.cepErro = 'CEP não encontrado. Preencha o endereço manualmente.';
          return;
        }
        if (end.street) this.ruaEnd = end.street;
        if (end.neighborhood) this.bairroEnd = end.neighborhood;
        if (end.city) this.cidadeEnd = end.city;
        if (end.state) this.estadoEnd = end.state;
      })
      .catch(() => {
        this.cepErro = 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.';
      })
      .finally(() => (this.cepBuscando = false));
  }

  /** Monta o endereço só se houver algum campo preenchido; senão, não envia. */
  private montarEndereco(): RestaurantAddressDto | undefined {
    const address: RestaurantAddressDto = {
      street: this.ruaEnd.trim() || undefined,
      number: this.numeroEnd.trim() || undefined,
      neighborhood: this.bairroEnd.trim() || undefined,
      city: this.cidadeEnd.trim() || undefined,
      state: this.estadoEnd.trim() || undefined,
      zipCode: this.cepEnd.trim() || undefined,
      latitude: this.latEnd || undefined,
      longitude: this.lngEnd || undefined,
    };
    return Object.values(address).some((v) => v !== undefined) ? address : undefined;
  }

  get categoriaLabel(): string {
    return this.categorias.find((c) => c.id === this.categoriaId)?.name ?? 'Selecione';
  }

  toggleCategoria() {
    this.categoriaAberta = !this.categoriaAberta;
  }

  selecionarCategoria(cat: ResponseRestaurantCategoryDto) {
    this.categoriaId = cat.id;
    this.categoriaAberta = false;
  }

  toggleAberto() {
    this.aberto = !this.aberto;
  }

  salvar() {
    this.erro = '';
    this.aviso = '';
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do restaurante.';
      return;
    }
    if (this.categoriaId == null) {
      this.erro = this.categorias.length ? 'Selecione uma categoria.' : 'Não foi possível carregar as categorias. Tente novamente.';
      return;
    }
    if (!this.tempoEntregaValido()) {
      this.erro = 'Tempo de entrega inválido (1 a 480 min; máximo não pode ser menor que o mínimo).';
      return;
    }
    this.salvando = true;

    if (this.restaurante) {
      this.fornecedorService
        .atualizarRestaurante(this.restaurante.id, {
          name: this.nome.trim(),
          description: this.descricao.trim() || undefined,
          imageUrl: this.imageUrl || undefined,
          imageKey: this.imageKey || undefined,
          categoryId: this.categoriaId,
          isOpen: this.aberto,
          deliveryTimeMinMinutes: this.tempoMin ?? undefined,
          deliveryTimeMaxMinutes: this.tempoMax ?? undefined,
          address: this.montarEndereco(),
        })
        .subscribe({
          next: (r) => {
            this.salvando = false;
            this.aplicar(r);
            this.aviso = 'Restaurante atualizado.';
          },
          error: (e: ApiError) => this.falhar(e),
        });
    } else {
      this.fornecedorService
        .criarRestaurante({
          name: this.nome.trim(),
          categoryId: this.categoriaId,
          description: this.descricao.trim() || undefined,
          imageUrl: this.imageUrl || undefined,
          imageKey: this.imageKey || undefined,
          deliveryTimeMinMinutes: this.tempoMin ?? undefined,
          deliveryTimeMaxMinutes: this.tempoMax ?? undefined,
          address: this.montarEndereco(),
        })
        .subscribe({
          next: (res) => {
            this.salvando = false;
            // Usa o restaurante retornado pelo POST — não depende do /me (que pode demorar a refletir).
            if (res?.restaurant) this.aplicar(res.restaurant);
            this.aviso = 'Restaurante criado com sucesso!';
          },
          error: (e: ApiError) => this.falhar(e),
        });
    }
  }

  /** 1..480 por campo; se ambos preenchidos, máximo não pode ser menor que o mínimo. */
  private tempoEntregaValido(): boolean {
    const dentro = (v?: number) => v == null || (Number.isFinite(v) && v >= 1 && v <= 480);
    if (!dentro(this.tempoMin) || !dentro(this.tempoMax)) return false;
    if (this.tempoMin != null && this.tempoMax != null && this.tempoMax < this.tempoMin) return false;
    return true;
  }

  private falhar(err: ApiError) {
    this.salvando = false;
    // 403 de assinatura (BE-15): o fornecedor precisa de um plano ativo antes de operar.
    if (err?.status === 403) {
      this.precisaAssinatura = true;
      this.erro = err?.message?.trim()
        ? err.message
        : 'É necessário ter uma assinatura ativa para realizar esta operação.';
      return;
    }
    this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o restaurante.';
  }

  irParaAssinatura() {
    this.router.navigate(['/fornecedor/assinatura']);
  }

  irParaCardapio() {
    this.router.navigate(['/fornecedor/cardapio']);
  }

  voltar() {
    history.back();
  }
}
