import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SessionService } from './session';
import { environment } from '../../../environments/environment';

/**
 * `delivery:location` — última posição do entregador.
 * O back emite `lat`/`lng` como string (vem de `Decimal.toString()`); tratamos
 * como `string | number` e convertemos com `Number()` na hora de posicionar.
 */
export interface DeliveryLocation {
  deliveryId: number;
  lat: string | number;
  lng: string | number;
  updatedAt?: string;
}

/** `delivery:status` — mudança de status da entrega. */
export interface DeliveryStatusEvent {
  deliveryId: number;
  status: string;
}

/**
 * Rastreamento da entrega em tempo real (Fase 8.4), via WebSocket socket.io no
 * namespace `/deliveries`. O token JWT vai no handshake (`auth.token` + header).
 *
 * Cliente: `track(deliveryId)` e assina `onLocation()`/`onStatus()`.
 * O back grava a última posição no pedido, então a tela mostra algo mesmo antes
 * do primeiro evento (fallback em `currentLat/currentLng`).
 */
@Injectable({ providedIn: 'root' })
export class DeliveryTrackingService {
  private readonly session = inject(SessionService);

  private socket?: Socket;
  private readonly location$ = new Subject<DeliveryLocation>();
  private readonly status$ = new Subject<DeliveryStatusEvent>();

  /** apiBaseUrl termina em `/v1`; o socket conecta no host + namespace `/deliveries`. */
  private baseUrl(): string {
    return environment.apiBaseUrl.replace(/\/v1\/?$/, '');
  }

  private conectar(): Socket {
    if (this.socket) return this.socket;
    const token = this.session.token() ?? '';
    this.socket = io(`${this.baseUrl()}/deliveries`, {
      transports: ['websocket'],
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` },
    });
    this.socket.on('delivery:location', (p: DeliveryLocation) => this.location$.next(p));
    this.socket.on('delivery:status', (p: DeliveryStatusEvent) => this.status$.next(p));
    return this.socket;
  }

  /** Entra no canal da entrega e passa a receber posição/status. */
  track(deliveryId: number): void {
    this.conectar().emit('delivery:track', { deliveryId });
  }

  /** Sai do canal da entrega. */
  untrack(deliveryId: number): void {
    this.socket?.emit('delivery:untrack', { deliveryId });
  }

  onLocation(): Observable<DeliveryLocation> {
    return this.location$.asObservable();
  }

  onStatus(): Observable<DeliveryStatusEvent> {
    return this.status$.asObservable();
  }

  desconectar(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
