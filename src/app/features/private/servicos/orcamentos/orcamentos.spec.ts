import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { OrcamentosComponent } from './orcamentos';

describe('OrcamentosComponent', () => {
  let component: OrcamentosComponent;
  let fixture: ComponentFixture<OrcamentosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrcamentosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OrcamentosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista orçamentos solicitados (scope=Requested) mapeados', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/budgets'));
    expect(req.request.params.get('scope')).toBe('Requested');
    req.flush({
      budgets: [
        { id: 1, description: 'Reparo', status: 'Responded', responseValue: '350.00', service: { id: 3, name: 'Reforma' }, requester: { id: 2, name: 'Ana' }, provider: { id: 9, name: 'Joelson' }, createdAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.orcamentos.length).toBe(1);
    expect(component.orcamentos[0].prestador.nome).toBe('Joelson');
    expect(component.orcamentos[0].status).toBe('em_andamento');
  });
});
