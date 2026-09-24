import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ChatService } from './chat';

describe('ChatService — inbox e não-lidos (BE-Q5)', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('naoLidasTotal() mapeia o total de /chats/unread-count', () => {
    let total = -1;
    service.naoLidasTotal().subscribe((t) => (total = t));
    httpMock.expectOne((r) => r.url.endsWith('/chats/unread-count')).flush({ total: 3 });
    expect(total).toBe(3);
  });

  it('naoLidasTotal() tolera resposta vazia → 0', () => {
    let total = -1;
    service.naoLidasTotal().subscribe((t) => (total = t));
    httpMock.expectOne((r) => r.url.endsWith('/chats/unread-count')).flush({});
    expect(total).toBe(0);
  });

  it('inbox() mapeia título, prévia e não-lidos', () => {
    let lista: unknown;
    service.inbox().subscribe((l) => (lista = l));
    httpMock.expectOne((r) => r.url.endsWith('/chats')).flush({
      chats: [
        {
          id: 55, contextType: 'Budget', referenceId: 9, unreadCount: 2,
          lastMessageAt: '2026-03-16T10:00:00.000Z',
          otherUser: { id: 9, name: 'Joelson', fileUrl: 'x' },
          lastMessage: { id: 1, message: 'Bom dia', senderId: 9, createdAt: '' },
          createdAt: '', updatedAt: '',
        },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    const c = (lista as { titulo: string; previa: string; naoLidas: number; foto: string }[])[0];
    expect(c.titulo).toBe('Joelson');
    expect(c.previa).toBe('Bom dia');
    expect(c.naoLidas).toBe(2);
    expect(c.foto).toBe('x');
  });

  it('inbox() usa rótulo de anexo quando a última mensagem é arquivo', () => {
    let lista: unknown;
    service.inbox().subscribe((l) => (lista = l));
    httpMock.expectOne((r) => r.url.endsWith('/chats')).flush({
      chats: [
        {
          id: 56, contextType: 'Work', referenceId: 5, unreadCount: 0,
          lastMessage: { id: 2, fileName: 'foto.jpg', senderId: 2, createdAt: '' },
          createdAt: '', updatedAt: '',
        },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    const c = (lista as { titulo: string; previa: string }[])[0];
    expect(c.titulo).toBe('Conversa'); // sem otherUser → fallback
    expect(c.previa).toBe('📎 Anexo');
  });
});
