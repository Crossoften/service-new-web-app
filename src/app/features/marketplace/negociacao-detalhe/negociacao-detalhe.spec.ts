import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { NegociacaoDetalheComponent } from './negociacao-detalhe';
import { SessionService } from '../../../core/services/session';

describe('NegociacaoDetalheComponent', () => {
  let component: NegociacaoDetalheComponent;
  let fixture: ComponentFixture<NegociacaoDetalheComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegociacaoDetalheComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      ],
    }).compileComponents();

    // Sessão como comprador (id 2).
    TestBed.inject(SessionService).setSession({
      token: 't',
      userId: 2,
      profileType: 'Client',
      role: null,
    });

    fixture = TestBed.createComponent(NegociacaoDetalheComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.inject(SessionService).clear();
  });

  it('carrega a negociação e habilita pagamento p/ comprador em status Accepted', () => {
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions/5')).flush({
      id: 5,
      referenceType: 'Product',
      referenceId: 1,
      status: 'Accepted',
      requestedAmount: '1000.00',
      chatRoomId: 9,
      buyer: { id: 2, name: 'Ana' },
      seller: { id: 3, name: 'Bob' },
      createdAt: '', updatedAt: '',
    });
    expect(component.souComprador).toBe(true);
    expect(component.podePagar).toBe(true);
    expect(component.statusLabel).toBe('Aceita');
  });

  it('paga com o método selecionado (POST pay)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions/5')).flush({
      id: 5, referenceType: 'Product', referenceId: 1, status: 'Accepted', requestedAmount: '1000.00',
      chatRoomId: 9, buyer: { id: 2, name: 'Ana' }, seller: { id: 3, name: 'Bob' }, createdAt: '', updatedAt: '',
    });
    component.metodoSelecionado = 'Pix';
    component.pagar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions/5/pay'));
    expect(req.request.body.method).toBe('Pix');
    req.flush({ id: 5, referenceType: 'Product', referenceId: 1, status: 'Paid', requestedAmount: '1000.00', chatRoomId: 9, buyer: { id: 2, name: 'Ana' }, seller: { id: 3, name: 'Bob' }, createdAt: '', updatedAt: '' });
    expect(component.negociacao?.status).toBe('Paid');
  });
});
