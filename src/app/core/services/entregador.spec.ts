import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { EntregadorService, GanhosEntregador } from './entregador';

describe('EntregadorService', () => {
  let service: EntregadorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EntregadorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ganhos() mapeia available/paid/total de GET /deliveries/me/earnings (§8.5)', () => {
    let g: GanhosEntregador | undefined;
    service.ganhos().subscribe((r) => (g = r));
    const req = httpMock.expectOne((r) => r.url.endsWith('/deliveries/me/earnings') && r.method === 'GET');
    req.flush({
      day: { amount: '30.00', deliveries: 3 },
      week: { amount: '120.00', deliveries: 12 },
      month: { amount: '480.00', deliveries: 40 },
      total: { amount: '500.00', deliveries: 42 },
      available: { amount: '80.00', deliveries: 7 },
      paid: { amount: '420.00', deliveries: 35 },
    });
    expect(g?.aReceber).toBe(80);
    expect(g?.aReceberEntregas).toBe(7);
    expect(g?.jaPago).toBe(420);
    expect(g?.total).toBe(500);
    expect(g?.dia).toBe(30);
  });

  it('ganhos() tolera campos ausentes (0)', () => {
    let g: GanhosEntregador | undefined;
    service.ganhos().subscribe((r) => (g = r));
    httpMock.expectOne((r) => r.url.endsWith('/deliveries/me/earnings')).flush({});
    expect(g?.aReceber).toBe(0);
    expect(g?.total).toBe(0);
  });
});
