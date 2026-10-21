import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../core/services/upload';
import { VIDEO_ACCEPT } from '../../../core/models/upload';
import { ApiError } from '../../../core/models/common';

/**
 * Upload de **vídeo** reutilizável (§8.14 — presign → S3 → confirm).
 * Mantém internamente o estado de envio/erro e o preview; o pai recebe a
 * `fileUrl`/`fileKey` pelo evento `(changed)` (emite `{url:'',key:''}` ao remover).
 */
@Component({
  selector: 'app-video-upload',
  imports: [CommonModule],
  templateUrl: './video-upload.html',
  styleUrl: './video-upload.scss',
})
export class VideoUploadComponent {
  private readonly uploads = inject(UploadService);
  readonly videoAccept = VIDEO_ACCEPT;

  /** URL atual do vídeo (preview) — usada no modo edição. */
  @Input() url = '';
  @Input() label = 'Vídeo do anúncio (opcional)';
  @Output() changed = new EventEmitter<{ url: string; key: string }>();

  enviando = false;
  erro = '';

  selecionar(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.erro = '';
    const invalido = this.uploads.validarVideo(file);
    if (invalido) {
      this.erro = invalido;
      return;
    }
    this.enviando = true;
    this.uploads.enviarVideo(file).subscribe({
      next: (res) => {
        this.enviando = false;
        this.url = res.fileUrl;
        this.changed.emit({ url: res.fileUrl, key: res.fileKey });
      },
      error: (err: ApiError) => {
        this.enviando = false;
        this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar o vídeo.';
      },
    });
  }

  remover() {
    this.url = '';
    this.changed.emit({ url: '', key: '' });
  }
}
