import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
import { FornecedorService } from '../../../core/services/fornecedor';
import { DeliveryService } from '../../../core/services/delivery';
import {
  RestaurantAddressDto,
  ResponseRestaurantCategoryDto,
  ResponseRestaurantDto,
} from '../../../core/models/restaurant';
import { ApiError } from '../../../core/models/common';
import {
  Coordenadas,
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

  restaurante: ResponseRestaurantDto | null = null;
  categorias: ResponseRestaurantCategoryDto[] = [];

  nome = '';
  descricao = '';
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

  carregando = false;
  carregandoCategorias = false;
  erroCategorias = false;
  salvando = false;
  erro = '';
  aviso = '';
  precisaAssinatura = false;

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
  }

  onCoordenadas(c: Coordenadas) {
    this.latEnd = c.latitude;
    this.lngEnd = c.longitude;
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
