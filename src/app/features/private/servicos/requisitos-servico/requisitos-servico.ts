import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { ServiceCatalogService } from '../../../../core/services/service-catalog';
import { ApiService } from '../../../../core/services/api';
import { UploadService } from '../../../../core/services/upload';
import { VIDEO_ACCEPT } from '../../../../core/models/upload';
import { ApiError } from '../../../../core/models/common';

interface Arquivo {
  id: number;
  nome: string;
  tipo: 'imagem' | 'vídeo';
  fileUrl: string;
  fileKey: string;
}

@Component({
  selector: 'app-requisitos-servico',
  imports: [CommonModule, FormsModule],
  templateUrl: './requisitos-servico.html',
  styleUrl: './requisitos-servico.scss',
})
export class RequisitosServicoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly api = inject(ApiService);
  private readonly uploads = inject(UploadService);

  readonly anexoAccept = `image/png,image/jpeg,image/webp,.heic,.heif,${VIDEO_ACCEPT}`;

  descricao = '';
  tipoServico = 'Urgente';
  tiposServico = ['Urgente', 'Normal', 'Agendado'];
  tipoAberto = false;
  erro = '';
  enviando = false;
  enviandoArquivo = false;

  private serviceIds: number[] = [];

  arquivos: Arquivo[] = [];

  ngOnInit() {
    const ids = this.route.snapshot.queryParamMap.get('ids') ?? '';
    this.serviceIds = ids
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);
  }

  toggleTipo() {
    this.tipoAberto = !this.tipoAberto;
  }

  selecionarTipo(tipo: string) {
    this.tipoServico = tipo;
    this.tipoAberto = false;
  }

  /**
   * Faz upload de um anexo (imagem ou vídeo) e o adiciona à lista. Imagem via
   * `POST /upload/one-file`; vídeo via presign → S3 → confirm (§8.14). Vários
   * arquivos: é só repetir — cada envio empilha um item.
   */
  selecionarArquivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.enviandoArquivo) return;
    this.erro = '';
    const ehVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|3gp)$/i.test(file.name);
    if (ehVideo) {
      const invalido = this.uploads.validarVideo(file);
      if (invalido) {
        this.erro = invalido;
        return;
      }
    }
    this.enviandoArquivo = true;
    const upload$ = ehVideo ? this.uploads.enviarVideo(file) : this.api.uploadOne(file);
    upload$.pipe(finalize(() => (this.enviandoArquivo = false))).subscribe({
      next: (res) => {
        this.arquivos = [
          ...this.arquivos,
          { id: Date.now(), nome: file.name, tipo: ehVideo ? 'vídeo' : 'imagem', fileUrl: res.fileUrl, fileKey: res.fileKey },
        ];
      },
      error: (err: ApiError) => {
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar o arquivo.';
      },
    });
  }

  removerArquivo(id: number) {
    this.arquivos = this.arquivos.filter((a) => a.id !== id);
  }

  confirmar() {
    if (this.enviando) return;
    this.erro = '';
    if (!this.descricao.trim()) {
      this.erro = 'Descreva sua solicitação.';
      return;
    }
    if (!this.serviceIds.length) {
      this.erro = 'Nenhum prestador selecionado.';
      return;
    }
    const descricao = `[${this.tipoServico}] ${this.descricao.trim()}`;
    const files = this.arquivos.map((a) => ({ fileName: a.nome, fileUrl: a.fileUrl, fileKey: a.fileKey }));
    this.enviando = true;
    forkJoin(
      this.serviceIds.length
        ? this.serviceIds.map((serviceId) =>
            this.catalog.solicitarOrcamento({ serviceId, description: descricao, files: files.length ? files : undefined }),
          )
        : [of(null)],
    )
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: () => this.router.navigate(['/servicos/orcamentos']),
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a solicitação.';
        },
      });
  }

  voltar() {
    history.back();
  }
}
