import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MeusAlugueisComponent } from './meus-alugueis';

describe('MeusAlugueisComponent', () => {
  let component: MeusAlugueisComponent;
  let fixture: ComponentFixture<MeusAlugueisComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusAlugueisComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MeusAlugueisComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista aluguéis (participantRole=All)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/rentals'));
    expect(req.request.params.get('participantRole')).toBe('All');
    req.flush({
      rentals: [
        { id: 1, status: 'Requested', startDate: '', endDate: '', price: '100.00', chatRoomId: 9, product: { id: 1, name: 'Betoneira' }, requester: { id: 2, name: 'Ana' }, provider: { id: 3, name: 'Bob' }, createdAt: '', updatedAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.alugueis.length).toBe(1);
  });
});
