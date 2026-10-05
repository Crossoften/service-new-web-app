import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, from } from 'rxjs';
import { ApiService } from './api';
import { SessionService } from './session';
import {
  ConfirmUploadDto,
  MAX_VIDEO_BYTES,
  PresignUploadDto,
  ResponseOneFileDto,
  ResponsePresignUploadDto,
  VIDEO_MIME_TYPES,
} from '../models/upload';

/**
 * Upload de vídeo em três passos (§8.14): o arquivo **não** passa pela API —
 * o navegador fala direto com o S3.
 *
 *   1. `POST /upload/presign`  → autorização (uploadUrl, fields, fileKey, token)
 *   2. `POST` na `uploadUrl`    → envio direto (fields e depois o `file`)
 *   3. `POST /upload/confirm`  → grava na tabela `files` e devolve a `fileUrl`
 *
 * O passo 2 usa `fetch` (não `HttpClient`) de propósito: o interceptor de auth
 * anexa o Bearer em toda requisição, e na estratégia `s3` o header `Authorization`
 * **quebra a assinatura** da AWS. Na estratégia `api` o header é obrigatório e é
 * anexado manualmente aqui.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);

  /** Passo 1 — `POST /v1/upload/presign`. */
  presign(dto: PresignUploadDto): Observable<ResponsePresignUploadDto> {
    return this.api.post<ResponsePresignUploadDto>('/upload/presign', dto);
  }

  /** Passo 3 — `POST /v1/upload/confirm`. */
  confirm(dto: ConfirmUploadDto): Observable<ResponseOneFileDto> {
    return this.api.post<ResponseOneFileDto>('/upload/confirm', dto);
  }

  /** Valida tipo + tamanho **antes** de pedir o presign. Retorna mensagem de erro ou `null`. */
  validarVideo(file: File): string | null {
    if (!(VIDEO_MIME_TYPES as readonly string[]).includes(file.type)) {
      return 'Formato de vídeo não suportado. Use mp4, mov, webm, mkv ou 3gp.';
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return 'Vídeo acima do tamanho máximo (200 MB).';
    }
    return null;
  }

  /** Fluxo completo: presign → envio direto → confirm. Emite o arquivo confirmado. */
  enviarVideo(file: File): Observable<ResponseOneFileDto> {
    return from(this.executar(file));
  }

  private async executar(file: File): Promise<ResponseOneFileDto> {
    const erro = this.validarVideo(file);
    if (erro) throw new Error(erro);

    const presign = await firstValueFrom(
      this.presign({ fileName: file.name, contentType: file.type }),
    );
    if (file.size > presign.maxBytes) {
      throw new Error('Vídeo acima do tamanho máximo permitido.');
    }

    await this.enviarParaStorage(file, presign);

    return firstValueFrom(this.confirm({ fileKey: presign.fileKey, token: presign.token }));
  }

  /** Passo 2 — envio direto ao storage (via `fetch`, fora do `HttpClient`). */
  private async enviarParaStorage(file: File, p: ResponsePresignUploadDto): Promise<void> {
    const form = new FormData();
    // `fields` vem vazio na estratégia `api` — o laço simplesmente não itera.
    Object.entries(p.fields ?? {}).forEach(([key, value]) => form.append(key, value));
    // O `file` vai POR ÚLTIMO: o S3 ignora tudo o que vier depois dele.
    form.append('file', file);

    const headers: Record<string, string> = {};
    // Só a estratégia `api` leva Authorization; na `s3` ele quebraria a assinatura.
    if (p.strategy === 'api') {
      const token = this.session.token();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(p.uploadUrl, { method: 'POST', body: form, headers });
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('A autorização de envio expirou. Tente enviar novamente.');
      }
      throw new Error('Falha ao enviar o vídeo. Tente novamente.');
    }
  }
}
