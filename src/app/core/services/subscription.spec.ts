import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SubscriptionService } from './subscription';
import { environment } from '../../../environments/environment';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('catalog() faz GET /subscriptions/catalog', () => {
    service.catalog().subscribe();
    const req = httpMock.expectOne(`${base}/subscriptions/catalog`);
    expect(req.request.method).toBe('GET');
    req.flush({ plans: [], categories: [], subscribedCount: 0 });
  });

  it('create() envia planId + categoryId no POST /subscriptions', () => {
    service.create({ planId: 1, categoryId: 7 }).subscribe();
    const req = httpMock.expectOne(`${base}/subscriptions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ planId: 1, categoryId: 7 });
    req.flush({ message: 'ok', checkoutUrl: 'https://mp/checkout', subscription: {} });
  });
});
