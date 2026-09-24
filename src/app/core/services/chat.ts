import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api';
import {
  ChatContextType,
  ChatInboxItemDto,
  CreateChatMessageDto,
  ResponseFindChatMessagesDto,
  ResponseFindChatsDto,
  ResponseUnreadCountDto,
} from '../models/chat';

/** Conversa do inbox (view-model — BE-Q5). */
export interface ConversaInbox {
  id: number;
  titulo: string;
  previa: string;
  quando: string;
  naoLidas: number;
  foto: string;
}

/** Chats de negócio (`/chats`). Cada negociação/reserva/etc tem um `chatRoomId`. */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(ApiService);

  /** Total de mensagens não lidas (para o badge) — `GET /v1/chats/unread-count`. */
  naoLidasTotal(): Observable<number> {
    return this.api
      .get<ResponseUnreadCountDto>('/chats/unread-count')
      .pipe(map((r) => r?.total ?? 0));
  }

  /** Inbox de conversas (view-model) — `GET /v1/chats`. */
  inbox(query: { take?: number; skip?: number } = {}): Observable<ConversaInbox[]> {
    return this.api
      .get<ResponseFindChatsDto>('/chats', { take: query.take, skip: query.skip })
      .pipe(map((r) => (r.chats ?? []).map((c) => this.mapInbox(c))));
  }

  private mapInbox(c: ChatInboxItemDto): ConversaInbox {
    return {
      id: c.id,
      titulo: c.otherUser?.name ?? 'Conversa',
      previa: this.previa(c),
      quando: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('pt-BR') : '',
      naoLidas: c.unreadCount ?? 0,
      foto: c.otherUser?.fileUrl ?? '',
    };
  }

  private previa(c: ChatInboxItemDto): string {
    const m = c.lastMessage;
    if (!m) return '';
    if (m.message?.trim()) return m.message;
    if (m.fileName?.trim()) return '📎 Anexo';
    return '';
  }

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
