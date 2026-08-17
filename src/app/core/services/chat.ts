import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  ChatContextType,
  CreateChatMessageDto,
  ResponseFindChatMessagesDto,
} from '../models/chat';

/** Chats de negócio (`/chats`). Cada negociação/reserva/etc tem um `chatRoomId`. */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(ApiService);

  /** Mensagens do chat (paginado) + cabeçalho — `GET /v1/chats/{id}/messages`. */
  mensagens(
    id: number,
    query: { search?: string; take?: number; skip?: number } = {},
  ): Observable<ResponseFindChatMessagesDto> {
    return this.api.get<ResponseFindChatMessagesDto>(`/chats/${id}/messages`, {
      search: query.search,
      take: query.take,
      skip: query.skip,
    });
  }

  /** Envia uma mensagem — `POST /v1/chats/{id}/messages`. */
  enviar(id: number, dto: CreateChatMessageDto): Observable<unknown> {
    return this.api.post(`/chats/${id}/messages`, dto);
  }

  /** Marca o chat como lido — `PATCH /v1/chats/{id}/read`. */
  marcarLido(id: number): Observable<unknown> {
    return this.api.patch(`/chats/${id}/read`, {});
  }

  /** Abre/recupera o chat a partir do contexto de negócio. */
  abrirPorContexto(contextType: ChatContextType, referenceId: number): Observable<unknown> {
    return this.api.get(`/chats/context/${contextType}/${referenceId}`);
  }
}
