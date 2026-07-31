/**
 * Contratos utilitários compartilhados por vários módulos.
 */

/** Corpo de resposta { message } (ImessageEntity no Swagger). */
export interface ApiMessage {
  message: string;
}

/** Retorno das rotas de upload (ResponseOneFileDto / IfileEntity). */
export interface UploadedFile {
  fileUrl: string;
  fileKey: string;
}

/** Erro HTTP já normalizado pelo errorInterceptor. */
export interface ApiError {
  status: number;
  message: string;
  /** Payload original de erro devolvido pela API, quando houver. */
  raw?: unknown;
}
