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
});
