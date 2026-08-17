import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AluguelDetalheComponent } from './aluguel-detalhe';
import { SessionService } from '../../../core/services/session';

describe('AluguelDetalheComponent', () => {
  let component: AluguelDetalheComponent;
  let fixture: ComponentFixture<AluguelDetalheComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AluguelDetalheComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    // Sessão como locador (id 3).
    TestBed.inject(SessionService).setSession({ token: 't', userId: 3, profileType: 'Client', role: null });

    fixture = TestBed.createComponent(AluguelDetalheComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(SessionService).clear();
  });

  it('habilita aceitar/recusar p/ locador em status Requested', () => {
    httpMock.expectOne((r) => r.url.endsWith('/rentals/1')).flush(rental('Requested'));
    expect(component.souLocador).toBe(true);
    expect(component.podeResponder).toBe(true);
  });

  it('aceita o aluguel (PATCH respond)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/rentals/1')).flush(rental('Requested'));
    component.aceitar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/rentals/1/respond'));
    expect(req.request.body.status).toBe('Accepted');
    req.flush(rental('Accepted'));
    expect(component.aluguel?.status).toBe('Accepted');
  });

  function rental(status: string) {
    return {
      id: 1, status, startDate: '', endDate: '', price: '100.00', chatRoomId: 9,
      product: { id: 1, name: 'Betoneira' }, requester: { id: 2, name: 'Ana' }, provider: { id: 3, name: 'Bob' },
      createdAt: '', updatedAt: '',
    };
  }
});
