import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiMessage, UploadedFile } from '../models/common';

type ParamValue = string | number | boolean | null | undefined;
type ParamsInput = Record<string, ParamValue>;

/**
 * Wrapper fino sobre HttpClient:
 *  - prefixa o apiBaseUrl (`/v1`);
 *  - remove params nulos/vazios;
 *  - centraliza os helpers de upload de arquivo.
 * Cada service de módulo injeta este ApiService em vez de HttpClient diretamente.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, params?: ParamsInput): Observable<T> {
    return this.http.get<T>(this.url(path), { params: this.toHttpParams(params) });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body ?? {});
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(this.url(path), body ?? {});
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body ?? {});
  }

  delete<T>(path: string, params?: ParamsInput): Observable<T> {
    return this.http.delete<T>(this.url(path), { params: this.toHttpParams(params) });
  }

  /** Upload de um arquivo (multipart) — POST /upload/one-file. */
  uploadOne(file: File): Observable<UploadedFile> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadedFile>(this.url('/upload/one-file'), form);
  }

  /** Upload de múltiplos arquivos (máx. 5) — POST /upload/many-files. */
  uploadMany(files: File[]): Observable<UploadedFile[]> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    return this.http.post<UploadedFile[]>(this.url('/upload/many-files'), form);
  }

  /** Remove um arquivo pelo id — DELETE /one-file/{id}. */
  deleteFile(id: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(this.url(`/one-file/${id}`));
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private toHttpParams(params?: ParamsInput): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === null || value === undefined || value === '') {
        continue;
      }
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
