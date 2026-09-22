import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { SwPush } from '@angular/service-worker';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { PushService } from './push';

function makeSwPush(over: Partial<Record<string, unknown>> = {}) {
  return {
    isEnabled: true,
    subscription: of(null),
    requestSubscription: vi.fn(),
    unsubscribe: vi.fn(() => Promise.resolve()),
    ...over,
  } as unknown as SwPush;
}

function setup(swPush: SwPush) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SwPush, useValue: swPush },
    ],
  });
  return {
    service: TestBed.inject(PushService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('PushService', () => {
  it('ativar(): sem service worker → "indisponivel", sem HTTP', async () => {
    const { service, httpMock } = setup(makeSwPush({ isEnabled: false }));
    const r = await service.ativar();
    expect(r).toBe('indisponivel');
    httpMock.expectNone(() => true);
  });

  it('ativar(): publicKey null → "sem-vapid" e NÃO pede permissão (§8.10)', async () => {
    const swPush = makeSwPush();
    const { service, httpMock } = setup(swPush);
    const p = service.ativar();
    httpMock.expectOne((r) => r.url.endsWith('/push/public-key')).flush({ publicKey: null });
    const r = await p;
    expect(r).toBe('sem-vapid');
    // A chave estava null → requestSubscription (que dispara o prompt) não é chamado.
    expect(swPush.requestSubscription).not.toHaveBeenCalled();
    httpMock.expectNone((req) => req.url.endsWith('/push/subscriptions'));
  });

  it('ativar(): com publicKey inscreve e faz POST /push/subscriptions', async () => {
    const fakeSub = {
      endpoint: 'https://fcm/abc',
      toJSON: () => ({ endpoint: 'https://fcm/abc', keys: { p256dh: 'P', auth: 'A' } }),
    } as unknown as PushSubscription;
    const swPush = makeSwPush({ requestSubscription: vi.fn(() => Promise.resolve(fakeSub)) });
    const { service, httpMock } = setup(swPush);

    const p = service.ativar();
    httpMock.expectOne((r) => r.url.endsWith('/push/public-key')).flush({ publicKey: 'VAPID_KEY' });
    // aguarda a Promise interna encadear o POST
    await new Promise((res) => setTimeout(res, 0));
    const req = httpMock.expectOne((r) => r.url.endsWith('/push/subscriptions') && r.method === 'POST');
    expect(req.request.body).toEqual({ endpoint: 'https://fcm/abc', keys: { p256dh: 'P', auth: 'A' } });
    req.flush({});
    expect(await p).toBe('ativado');
  });

  it('removerInscricao faz DELETE com o endpoint no corpo', () => {
    const { service, httpMock } = setup(makeSwPush());
    service.removerInscricao('https://fcm/abc').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/push/subscriptions') && r.method === 'DELETE');
    expect(req.request.body).toEqual({ endpoint: 'https://fcm/abc' });
    req.flush({});
  });
});
