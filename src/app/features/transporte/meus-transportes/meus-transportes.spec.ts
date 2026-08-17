import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MeusTransportesComponent } from './meus-transportes';

describe('MeusTransportesComponent', () => {
  let component: MeusTransportesComponent;
  let fixture: ComponentFixture<MeusTransportesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusTransportesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MeusTransportesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista pedidos de transporte (participantRole=All)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/transport-requests'));
    expect(req.request.params.get('participantRole')).toBe('All');
    req.flush({
      transportRequests: [
        { id: 1, status: 'Requested', origin: 'A', destination: 'B', chatRoomId: 9, transportation: { id: 1, name: 'Caminhão' }, requester: { id: 2, name: 'Ana' }, provider: { id: 3, name: 'Bob' }, createdAt: '', updatedAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.pedidos.length).toBe(1);
  });
});
