import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ListagemEmpregosComponent } from './listagem-empregos';

describe('ListagemEmpregosComponent', () => {
  let component: ListagemEmpregosComponent;
  let fixture: ComponentFixture<ListagemEmpregosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemEmpregosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemEmpregosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('lista vagas ativas (scope=All)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs'));
    expect(req.request.params.get('scope')).toBe('All');
    req.flush({
      jobs: [{ id: 1, title: 'Dev Back-end', type: 'PJ', isActive: true, employer: { id: 9, name: 'Empresa X' }, createdAt: '', updatedAt: '' }],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    expect(component.vagas.length).toBe(1);
  });

  it('vagasFiltradas aplica busca, tipo e "mais recentes"', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({ jobs: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
    component.vagas = [
      { id: 1, title: 'Dev Back-end', type: 'PJ', employer: { id: 1, name: 'Alpha' }, createdAt: '2026-01-01', updatedAt: '' } as never,
      { id: 2, title: 'Designer', type: 'CLT', employer: { id: 2, name: 'Beta' }, createdAt: '2026-03-01', updatedAt: '' } as never,
    ];
    component.busca = 'dev';
    expect(component.vagasFiltradas.map((v) => v.id)).toEqual([1]);
    component.busca = '';
    component.selecionarTipo('CLT');
    expect(component.vagasFiltradas.map((v) => v.id)).toEqual([2]);
    component.selecionarTipo('todos');
    component.toggleRecentes();
    expect(component.vagasFiltradas.map((v) => v.id)).toEqual([2, 1]); // mais recentes primeiro
  });

  it('modo público: título "Vagas" e scope=All', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({ jobs: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
    expect(component.titulo).toBe('Vagas');
    expect(component.mine).toBe(false);
  });
});

describe('ListagemEmpregosComponent (minhas vagas)', () => {
  let component: ListagemEmpregosComponent;
  let fixture: ComponentFixture<ListagemEmpregosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemEmpregosComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { mine: true } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemEmpregosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('modo "minhas vagas": título "Minhas vagas" e scope=Mine', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs'));
    expect(req.request.params.get('scope')).toBe('Mine');
    req.flush({ jobs: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
    expect(component.mine).toBe(true);
    expect(component.titulo).toBe('Minhas vagas');
  });
});
