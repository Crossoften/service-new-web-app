import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ChatUnreadStore } from './chat-unread-store';
import { SessionService } from './session';

function configure(authenticated: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SessionService, useValue: { isAuthenticated: () => authenticated } },
    ],
  });
  return {
    store: TestBed.inject(ChatUnreadStore),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('ChatUnreadStore (BE-Q5)', () => {
  it('refresh() com sessão ativa busca o total e atualiza o signal', () => {
    const { store, httpMock } = configure(true);
    store.refresh();
    httpMock.expectOne((r) => r.url.endsWith('/chats/unread-count')).flush({ total: 4 });
    expect(store.total()).toBe(4);
    httpMock.verify();
  });

  it('refresh() sem sessão não faz HTTP e zera', () => {
    const { store, httpMock } = configure(false);
    store.definir(3);
    store.refresh();
    httpMock.expectNone((r) => r.url.endsWith('/chats/unread-count'));
    expect(store.total()).toBe(0);
    httpMock.verify();
  });

  it('definir() e zerar() ajustam o total (sem negativos)', () => {
    const { store } = configure(true);
    store.definir(7);
    expect(store.total()).toBe(7);
    store.definir(-5);
    expect(store.total()).toBe(0);
    store.definir(2);
    store.zerar();
    expect(store.total()).toBe(0);
  });

  it('refresh() mantém o valor atual se a chamada falhar', () => {
    const { store, httpMock } = configure(true);
    store.definir(9);
    store.refresh();
    httpMock
      .expectOne((r) => r.url.endsWith('/chats/unread-count'))
      .flush('x', { status: 500, statusText: 'e' });
    expect(store.total()).toBe(9);
    httpMock.verify();
  });
});
