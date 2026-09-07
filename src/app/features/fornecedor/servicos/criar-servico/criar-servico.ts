import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ServiceCatalogService } from '../../../../core/services/service-catalog';
import { ApiService } from '../../../../core/services/api';
import { ServiceCategoryDto } from '../../../../core/models/service';
import { ApiError } from '../../../../core/models/common';
import { formatBRL, maskBRL, parseBRL } from '../../../../core/utils/currency';

@Component({
  selector: 'app-criar-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './criar-servico.html',
  styleUrl: './criar-servico.scss',
})
export class CriarServicoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly api = inject(ApiService);

  modoEdicao = false;
  servicoId?: number;

  categorias: ServiceCategoryDto[] = [];
  categoryId?: number;
  nome = '';
  tipo = 'Online';
  registro = '';
  valor = '';
  descricao = '';
  imagem = '';
  imageKey = '';
  bloqueado = false;
  tipoAberto = false;
  erro = '';
  salvando = false;
  enviandoFoto = false;

  tipos = ['Online', 'Presencial', 'Em domicílio'];

  ngOnInit() {
    this.catalog.categorias().subscribe({
      next: (cats) => (this.categorias = cats),
      error: () => {},
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.modoEdicao = true;
      this.servicoId = Number(id);
      this.catalog.meuServico(this.servicoId).subscribe({
        next: (s) => {
          this.categoryId = s.categoryId;
          this.nome = s.nome;
          this.tipo = s.tipo;
          this.registro = s.registro;
          this.valor = formatBRL(Number(s.valor));
          this.descricao = s.descricao;
          this.imagem = s.imagem;
          this.imageKey = s.imageKey ?? '';
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar o serviço.';
        },
      });
    }
  }

  toggleTipo() {
    this.tipoAberto = !this.tipoAberto;
  }

  selecionarTipo(tipo: string) {
    this.tipo = tipo;
    this.tipoAberto = false;
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
          this.imagem = res.fileUrl;
          this.imageKey = res.fileKey;
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a imagem.';
        },
      });
  }

  onValorInput(valor: string) {
    this.valor = maskBRL(valor);
  }

  criarServico() {
    if (this.salvando) return;
    this.erro = '';
    if (!this.categoryId) {
      this.erro = 'Selecione a categoria.';
      return;
    }
    if (!this.nome.trim()) {
      this.erro = 'Informe o nome do serviço.';
      return;
    }
    const valorNum = parseBRL(this.valor);
    if (!valorNum || valorNum <= 0) {
      this.erro = 'Informe um valor válido.';
      return;
    }

    const dto = {
      name: this.nome.trim(),
      type: this.catalog.tipoApi(this.tipo),
      registrationCode: this.registro.trim() || undefined,
      price: valorNum,
      description: this.descricao.trim() || undefined,
      imageUrl: this.imagem || undefined,
      imageKey: this.imageKey || undefined,
      categoryId: this.categoryId,
    };

    this.salvando = true;
    const req$ =
      this.modoEdicao && this.servicoId
        ? this.catalog.atualizarServico(this.servicoId, dto)
        : this.catalog.criarServico(dto);

    req$.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => this.router.navigate(['/fornecedor/servicos']),
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível salvar o serviço.';
      },
    });
  }

  voltar() {
    history.back();
  }
}
