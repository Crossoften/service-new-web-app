import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MinhasReservasComponent } from './minhas-reservas';

describe('MinhasReservasComponent', () => {
  let component: MinhasReservasComponent;
  let fixture: ComponentFixture<MinhasReservasComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhasReservasComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MinhasReservasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista reservas (participantRole=All)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/bookings'));
    expect(req.request.params.get('participantRole')).toBe('All');
    req.flush({
      bookings: [
        { id: 1, status: 'Requested', checkIn: '', checkOut: '', guests: 2, totalValue: '960.00', chatRoomId: 9, accommodation: { id: 1, name: 'Hotel' }, requester: { id: 2, name: 'Ana' }, provider: { id: 3, name: 'Bob' }, createdAt: '', updatedAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.reservas.length).toBe(1);
  });
});
