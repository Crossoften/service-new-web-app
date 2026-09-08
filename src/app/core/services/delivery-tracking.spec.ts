import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

// Socket falso e controlável: guarda os handlers registrados por evento para
// que o teste possa disparar `delivery:location`/`delivery:status` à mão.
// `vi.hoisted` garante que estes objetos existam antes de `vi.mock` rodar
// (o mock é içado para o topo do módulo).
const { handlers, fakeSocket, ioMock } = vi.hoisted(() => {
  const handlers: Record<string, (p: unknown) => void> = {};
  const fakeSocket = {
    on: vi.fn((evt: string, cb: (p: unknown) => void) => {
      handlers[evt] = cb;
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
  };
  const ioMock = vi.fn((..._args: unknown[]) => fakeSocket);
  return { handlers, fakeSocket, ioMock };
});

vi.mock('socket.io-client', () => ({
  io: ioMock,
  Socket: class {},
}));

import { DeliveryTrackingService } from './delivery-tracking';

describe('DeliveryTrackingService', () => {
  let service: DeliveryTrackingService;

  beforeEach(() => {
    ioMock.mockClear();
    fakeSocket.emit.mockClear();
    fakeSocket.disconnect.mockClear();
    for (const k of Object.keys(handlers)) delete handlers[k];
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryTrackingService);
  });

  it('conecta uma única vez e entra no canal ao rastrear', () => {
    service.track(10);
    service.track(10);
    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock.mock.calls[0][0]).toContain('/deliveries');
    expect(fakeSocket.emit).toHaveBeenCalledWith('delivery:track', { deliveryId: 10 });
  });

  it('encaminha delivery:location por onLocation()', () => {
    const recebidos: unknown[] = [];
    service.onLocation().subscribe((p) => recebidos.push(p));
    service.track(7);
    handlers['delivery:location']({ deliveryId: 7, lat: '-18.9', lng: '-48.2' });
    expect(recebidos).toEqual([{ deliveryId: 7, lat: '-18.9', lng: '-48.2' }]);
  });

  it('encaminha delivery:status por onStatus()', () => {
    const recebidos: unknown[] = [];
    service.onStatus().subscribe((p) => recebidos.push(p));
    service.track(7);
    handlers['delivery:status']({ deliveryId: 7, status: 'OnTheWay' });
    expect(recebidos).toEqual([{ deliveryId: 7, status: 'OnTheWay' }]);
  });

  it('emite delivery:untrack ao sair do canal', () => {
    service.track(3);
    service.untrack(3);
    expect(fakeSocket.emit).toHaveBeenCalledWith('delivery:untrack', { deliveryId: 3 });
  });

  it('desconecta e permite reconectar', () => {
    service.track(1);
    service.desconectar();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
    service.track(1);
    expect(ioMock).toHaveBeenCalledTimes(2);
  });
});
