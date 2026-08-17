import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ReservaDetalheComponent } from './reserva-detalhe';
import { SessionService } from '../../../core/services/session';

describe('ReservaDetalheComponent', () => {
  let component: ReservaDetalheComponent;
  let fixture: ComponentFixture<ReservaDetalheComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaDetalheComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    // Sessão como anfitrião (id 3).
    TestBed.inject(SessionService).setSession({ token: 't', userId: 3, profileType: 'Supplier', role: null });

    fixture = TestBed.createComponent(ReservaDetalheComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(SessionService).clear();
  });

  it('confirma reserva Requested (anfitrião)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/bookings/1')).flush(booking('Requested'));
    expect(component.souAnfitriao).toBe(true);
    expect(component.podeResponder).toBe(true);
    component.confirmar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/bookings/1/respond'));
    expect(req.request.body.status).toBe('Confirmed');
    req.flush(booking('Confirmed'));
    expect(component.reserva?.status).toBe('Confirmed');
  });

  function booking(status: string) {
    return {
      id: 1, status, checkIn: '', checkOut: '', guests: 2, totalValue: '960.00', chatRoomId: 9,
      accommodation: { id: 1, name: 'Hotel' }, requester: { id: 2, name: 'Ana' }, provider: { id: 3, name: 'Bob' },
      createdAt: '', updatedAt: '',
    };
  }
});
