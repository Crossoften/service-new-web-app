import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiService } from './api';
import { PushSubscriptionDto, ResponsePublicKeyDto } from '../models/push';

/**
 * Resultado de `ativar()`:
 * - `ativado`      — inscrito e enviado ao back;
 * - `sem-vapid`    — `publicKey` veio `null` (VAPID não configurado). **Não** pedimos
 *                    permissão ao usuário — gastar o "sim" para não enviar nada a queima;
 * - `indisponivel` — service worker não ativo (ex.: dev, ou navegador sem suporte);
 * - `negado`       — o usuário recusou a permissão.
 */
export type PushAtivarResultado = 'ativado' | 'sem-vapid' | 'indisponivel' | 'negado';

/** Notificações push (PWA, §8.10). */
@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly api = inject(ApiService);
  private readonly swPush = inject(SwPush);

  /** SW ativo (push só funciona no build de produção, com HTTPS). */
  get disponivel(): boolean {
    return this.swPush.isEnabled;
  }

  publicKey(): Observable<ResponsePublicKeyDto> {
    return this.api.get<ResponsePublicKeyDto>('/push/public-key');
  }

  enviarInscricao(dto: PushSubscriptionDto): Observable<unknown> {
    // Idempotente por `endpoint` — reenviar não duplica (§8.10).
    return this.api.post('/push/subscriptions', dto);
  }

  removerInscricao(endpoint: string): Observable<unknown> {
    return this.api.deleteBody('/push/subscriptions', { endpoint });
  }

  /**
   * Ativa as notificações **a partir de um gesto do usuário** (nunca no load).
   * Só pede permissão depois de confirmar que há `publicKey` — se vier `null`,
   * retorna `sem-vapid` sem tocar na permissão (§8.10).
   */
  async ativar(): Promise<PushAtivarResultado> {
    if (!this.swPush.isEnabled) return 'indisponivel';

    const { publicKey } = await firstValueFrom(this.publicKey());
    if (!publicKey) return 'sem-vapid';

    try {
      const sub = await this.swPush.requestSubscription({ serverPublicKey: publicKey });
      await firstValueFrom(this.enviarInscricao(this.toDto(sub)));
      return 'ativado';
    } catch {
      // Permissão negada ou falha na inscrição.
      return 'negado';
    }
  }

  /** Cancela a inscrição e avisa o back — chamar no logout (§8.10). */
  async desativar(): Promise<void> {
    if (!this.swPush.isEnabled) return;
    try {
      const sub = await firstValueFrom(this.swPush.subscription);
      const endpoint = sub?.endpoint;
      await this.swPush.unsubscribe().catch(() => undefined);
      if (endpoint) {
        await firstValueFrom(this.removerInscricao(endpoint)).catch(() => undefined);
      }
    } catch {
      // Sem inscrição ativa — nada a fazer.
    }
  }

  private toDto(sub: PushSubscription): PushSubscriptionDto {
    const json = sub.toJSON();
    return {
      endpoint: json.endpoint ?? sub.endpoint,
      keys: {
        p256dh: json.keys?.['p256dh'] ?? '',
        auth: json.keys?.['auth'] ?? '',
      },
    };
  }
}
