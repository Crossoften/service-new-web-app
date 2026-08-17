import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { TransportePedidoDetalheComponent } from './transporte-pedido-detalhe';
import { SessionService } from '../../../core/services/session';

describe('TransportePedidoDetalheComponent', () => {
  let component: TransportePedidoDetalheComponent;
  let fixture: ComponentFixture<TransportePedidoDetalheComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportePedidoDetalheComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    // Sessão como transportador (id 3).
    TestBed.inject(SessionService).setSession({ token: 't', userId: 3, profileType: 'Supplier', role: null });

    fixture = TestBed.createComponent(TransportePedidoDetalheComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(SessionService).clear();
  });

  it('habilita cotar p/ transportador em status Requested', () => {
    httpMock.expectOne((r) => r.url.endsWith('/transport-requests/1')).flush(pedido('Requested'));
    expect(component.souTransportador).toBe(true);
    expect(component.podeCotar).toBe(true);
  });

  it('envia cotação (PATCH quote)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/transport-requests/1')).flush(pedido('Requested'));
    component.valorCotacao = 350;
    component.cotar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/transport-requests/1/quote'));
    expect(req.request.body.quotedValue).toBe(350);
    req.flush(pedido('Quoted'));
    expect(component.pedido?.status).toBe('Quoted');
  });

  function pedido(status: string) {
    return {
      id: 1, status, origin: 'A', destination: 'B', chatRoomId: 9,
      transportation: { id: 1, name: 'Caminhão' }, requester: { id: 2, name: 'Ana' }, provider: { id: 3, name: 'Bob' },
      createdAt: '', updatedAt: '',
    };
  }
});
