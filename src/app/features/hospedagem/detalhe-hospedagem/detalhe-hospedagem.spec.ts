import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { DetalheHospedagemComponent } from './detalhe-hospedagem';

describe('DetalheHospedagemComponent', () => {
  let component: DetalheHospedagemComponent;
  let fixture: ComponentFixture<DetalheHospedagemComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheHospedagemComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalheHospedagemComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/accommodations/1')).flush({
      id: 1, name: 'Novo Leste Hotel', price: '320.00', isActive: true,
      category: { id: 1, name: 'Hotel', slug: 'hotel', isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
      user: { id: 15, name: 'Joelson' }, positiveReviews: 0, negativeReviews: 0,
      categoryId: 1, userId: 15, createdAt: '', updatedAt: '',
    });
  });

  afterEach(() => httpMock.verify());

  it('calcula noites e total e envia CreateBookingDto', () => {
    component.checkIn = '2026-09-01';
    component.checkOut = '2026-09-04';
    component.hospedes = 2;
    expect(component.noites).toBe(3);
    expect(component.totalEstimado).toBe(960);
    component.reservar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/bookings') && r.method === 'POST');
    expect(req.request.body.accommodationId).toBe(1);
    expect(req.request.body.guests).toBe(2);
    expect(req.request.body.totalValue).toBe(960);
    req.flush({ message: 'ok', booking: { id: 7 } });
    expect(component.sucesso).toContain('solicitada');
  });
});
