import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService } from './auth';
import { SessionService } from './session';

describe('AuthService', () => {
  let service: AuthService;
  let session: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    session = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    session.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('usa o profileType do /login quando presente (sem /my-self)', () => {
    service.login({ email: 'a@e.com', password: '123456' }).subscribe();
    httpMock
      .expectOne((r) => r.url.endsWith('/login'))
      .flush({ token: 't', id: 1, profileType: 'Supplier' });
    httpMock.expectNone((r) => r.url.endsWith('/my-self'));
    expect(session.profileType()).toBe('Supplier');
  });

  it('busca /my-self quando o /login não traz profileType', () => {
    service.login({ email: 'a@e.com', password: '123456' }).subscribe();
    httpMock.expectOne((r) => r.url.endsWith('/login')).flush({ token: 't', id: 1 });
    httpMock
      .expectOne((r) => r.url.endsWith('/my-self'))
      .flush({ id: 1, profileType: 'Delivery', role: 'User' });
    expect(session.profileType()).toBe('Delivery');
  });
});
