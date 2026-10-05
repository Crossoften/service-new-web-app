import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { NegociacoesComponent } from './negociacoes';

describe('NegociacoesComponent', () => {
  let component: NegociacoesComponent;
  let fixture: ComponentFixture<NegociacoesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegociacoesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(NegociacoesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista negociações (participantRole=All)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions'));
    expect(req.request.params.get('participantRole')).toBe('All');
    req.flush({
      transactions: [
        { id: 1, status: 'Requested', requestedAmount: '1000.00', buyer: { id: 2, name: 'Ana' }, seller: { id: 3, name: 'Bob' } },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.negociacoes.length).toBe(1);
  });

  it('separa por aba: Ativos (em jogo) x Histórico (terminais)', () => {
    httpMock.expectOne((r) => r.url.endsWith('/commercial-transactions')).flush({
      transactions: [
        { id: 1, status: 'Requested', requestedAmount: '10', buyer: { id: 2, name: 'A' }, seller: { id: 3, name: 'B' } },
        { id: 2, status: 'Paid', requestedAmount: '10', buyer: { id: 2, name: 'A' }, seller: { id: 3, name: 'B' } },
        { id: 3, status: 'Completed', requestedAmount: '10', buyer: { id: 2, name: 'A' }, seller: { id: 3, name: 'B' } },
        { id: 4, status: 'Rejected', requestedAmount: '10', buyer: { id: 2, name: 'A' }, seller: { id: 3, name: 'B' } },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 4,
    });

    component.selecionarAba('ativos');
    expect(component.negociacoesFiltradas.map((n) => n.id)).toEqual([1, 2]);

    component.selecionarAba('historico');
    expect(component.negociacoesFiltradas.map((n) => n.id)).toEqual([3, 4]);
  });
});
