/** Modelos do upload de arquivo (§8.14). */

/** Resposta de upload de um arquivo — `ResponseOneFileDto`. */
export interface ResponseOneFileDto {
  id: number;
  fileUrl: string;
  fileKey: string;
}

/** Corpo de `POST /v1/upload/presign` (PresignUploadDto). */
export interface PresignUploadDto {
  fileName: string;
  contentType: string;
}

/** Estratégia do presign: `s3` (direto no bucket) ou `api` (ambiente sem AWS). */
export type UploadStrategy = 's3' | 'api';

/** Resposta de `POST /v1/upload/presign` (ResponsePresignUploadDto). */
export interface ResponsePresignUploadDto {
  strategy: UploadStrategy;
  uploadUrl: string;
  /** Campos assinados do S3 — **vazio** na estratégia `api`. */
  fields: Record<string, string>;
  fileKey: string;
  token: string;
  maxBytes: number;
  expiresIn: number;
  /** URL de pré-visualização — só funciona **depois** do confirm. */
  previewUrl?: string;
}

/** Corpo de `POST /v1/upload/confirm` (ConfirmUploadDto). */
export interface ConfirmUploadDto {
  fileKey: string;
  token: string;
}

/** Tipos de vídeo aceitos (§8.14). */
export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
  'video/3gpp',
] as const;

/** Teto de vídeo: 200 MB. */
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

/** `accept` para inputs de vídeo (casa com os tipos aceitos). */
export const VIDEO_ACCEPT = '.mp4,.mov,.webm,.mkv,.3gp,video/mp4,video/quicktime,video/webm,video/x-matroska,video/3gpp';
