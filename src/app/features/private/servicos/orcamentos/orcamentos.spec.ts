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

  function flushStatuses() {
    const base = { responseValue: '10', service: { id: 3, name: 'S' }, requester: { id: 2, name: 'A' }, provider: { id: 9, name: 'P' }, createdAt: '' };
    httpMock.expectOne((r) => r.url.endsWith('/budgets')).flush({
      budgets: [
        { id: 1, description: 'd', status: 'Accepted', ...base },
        { id: 2, description: 'd', status: 'Rejected', ...base },
        { id: 3, description: 'd', status: 'Cancelled', ...base },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 3,
    });
  }

  it('separa Aceito/Recusado/Cancelado no VM (§8.8: recusar ≠ cancelar)', () => {
    flushStatuses();
    expect(component.orcamentos.map((o) => o.status)).toEqual(['aceito', 'recusado', 'cancelado']);
  });

  it('rotula e colore os novos estados distintamente', () => {
    flushStatuses();
    expect(component.statusLabel('recusado')).toBe('Recusado');
    expect(component.statusLabel('cancelado')).toBe('Cancelado');
    expect(component.statusClass('recusado')).toBe('status--vermelho');
    expect(component.statusClass('cancelado')).toBe('status--cinza');
    expect(component.statusClass('aceito')).toBe('status--verde');
  });

  it('aba "respondidos" inclui recusado mas exclui cancelado (desistência não é resposta)', () => {
    flushStatuses();
    component.tabAtiva = 'respondidos';
    const ids = component.orcamentosFiltrados.map((o) => o.id);
    expect(ids).toEqual([1, 2]); // aceito + recusado; cancelado (id 3) fora
  });
});
