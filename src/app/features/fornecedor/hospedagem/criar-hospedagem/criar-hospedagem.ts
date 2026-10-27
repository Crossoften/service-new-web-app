import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AccommodationService } from '../../../../core/services/accommodation';
import { ApiService } from '../../../../core/services/api';
import { CepService } from '../../../../core/services/cep';
import {
  AccommodationCategoryDto,
  CreateAccommodationDto,
} from '../../../../core/models/accommodation';
import { ApiError } from '../../../../core/models/common';
import { formatBRL, maskBRL, parseBRL } from '../../../../core/utils/currency';
import { VideoUploadComponent } from '../../../../shared/components/video-upload/video-upload';

@Component({
  selector: 'app-criar-hospedagem',
  imports: [CommonModule, FormsModule, VideoUploadComponent],
  templateUrl: './criar-hospedagem.html',
  styleUrl: './criar-hospedagem.scss',
})
export class CriarHospedagemComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AccommodationService);
  private readonly api = inject(ApiService);
  private readonly cepService = inject(CepService);

  editId?: number;
  categorias: AccommodationCategoryDto[] = [];
  categoriasCarregadas = false;

  categoryId?: number;
  nome = '';
  preco = '';
  quartos?: number;
  cep = '';
  cepBuscando = false;
  cepErro = '';
  rua = '';
  bairro = '';
  cidade = '';
  estado = '';
  descricao = '';
  imageUrl = '';
  imageKey = '';
  videoUrl = '';
  videoKey = '';
  ativa = true;

  carregando = false;
  salvando = false;
  enviandoFoto = false;
  erro = '';

  ngOnInit() {
    this.service.categorias().subscribe({
      next: (cats) => {
        this.categorias = cats;
        this.categoriasCarregadas = true;
      },
      error: () => (this.categoriasCarregadas = true),
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.editId = Number(id);
      this.carregando = true;
      this.service
        .acomodacao(this.editId)
        .pipe(finalize(() => (this.carregando = false)))
        .subscribe({
          next: (a) => {
            this.categoryId = a.categoryId;
            this.nome = a.name;
            this.preco = formatBRL(Number(a.price));
            this.quartos = a.roomsQuantity;
            this.rua = a.street ?? '';
            this.bairro = a.neighborhood ?? '';
            this.cidade = a.city ?? '';
            this.estado = a.state ?? '';
            this.descricao = a.description ?? '';
            this.imageUrl = a.imageUrl ?? '';
            this.imageKey = a.imageKey ?? '';
            this.videoUrl = a.videoUrl ?? '';
            this.videoKey = a.videoKey ?? '';
            this.ativa = a.isActive;
          },
          error: (err: ApiError) => {
            this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a hospedagem.';
          },
        });
    }
  }

  get semCategorias(): boolean {
    return this.categoriasCarregadas && this.categorias.length === 0;
  }

  get titulo(): string {
    return this.editId ? 'Editar hospedagem' : 'Nova hospedagem';
  }

  adicionarImagem(event: Event) {
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

  /** Recebe o vídeo enviado (ou vazio ao remover) do `<app-video-upload>`. */
  onVideo(v: { url: string; key: string }) {
    this.videoUrl = v.url;
    this.videoKey = v.key;
  }

  onPrecoInput(valor: string) {
    this.preco = maskBRL(valor);
  }

  /**
   * Preenche rua/bairro/cidade/UF a partir do CEP (ViaCEP), no blur do campo.
   * O CEP é só para a busca — a hospedagem não persiste `zipCode` (não está no DTO).
   */
  buscarCep() {
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

  salvar() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.categoryId) {
      this.erro = 'Selecione a categoria.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome da hospedagem.';
      return;
    }
    const precoNum = parseBRL(this.preco);
    if (!precoNum || precoNum <= 0) {
      this.erro = 'Informe um valor válido.';
      return;
    }

    const dto: CreateAccommodationDto = {
      categoryId: this.categoryId,
      name: this.nome.trim(),
      price: precoNum,
      roomsQuantity: this.quartos ?? undefined,
      street: this.rua.trim() || undefined,
      neighborhood: this.bairro.trim() || undefined,
      city: this.cidade.trim() || undefined,
      state: this.estado.trim() || undefined,
      description: this.descricao.trim() || undefined,
      imageUrl: this.imageUrl || undefined,
      imageKey: this.imageKey || undefined,
      videoUrl: this.videoUrl || undefined,
      videoKey: this.videoKey || undefined,
      isActive: this.ativa,
    };

    this.salvando = true;
    const req$ = this.editId
      ? this.service.atualizar(this.editId, dto)
      : this.service.criar(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => this.router.navigate(['/fornecedor/hospedagem']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar a hospedagem.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
