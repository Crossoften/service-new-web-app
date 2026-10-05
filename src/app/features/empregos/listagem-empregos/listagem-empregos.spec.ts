import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
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

  it('modo público: SEM FAB de publicar (cliente só se candidata), COM link de candidaturas', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({ jobs: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.le-fab')).toBeNull();
    expect(el.querySelector('.le-sub__link')).not.toBeNull();
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

  it('modo "minhas vagas": COM FAB de publicar, SEM link de candidaturas', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({ jobs: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.le-fab')).not.toBeNull();
    expect(el.querySelector('.le-sub__link')).toBeNull();
  });

  it('editar navega para a rota de edição', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({ jobs: [], currentPage: 1, totalPages: 1, totalRecords: 0 });
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const ev = { stopPropagation: () => {} } as Event;
    component.editar({ id: 5, title: 'X' } as never, ev);
    expect(nav).toHaveBeenCalledWith(['/empregos/vaga', 5, 'editar']);
  });

  it('excluir faz soft-delete (PATCH isActive:false) e remove da lista', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({
      jobs: [{ id: 5, title: 'Pintor', type: 'CLT', isActive: true, employer: { id: 1, name: 'A' }, createdAt: '', updatedAt: '' }],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const ev = { stopPropagation: () => {} } as Event;
    component.excluir(component.vagas[0], ev);
    const patch = httpMock.expectOne((r) => r.url.endsWith('/jobs/5') && r.method === 'PATCH');
    expect(patch.request.body.isActive).toBe(false);
    patch.flush({ id: 5, title: 'Pintor', type: 'CLT', isActive: false, employer: { id: 1, name: 'A' }, createdAt: '', updatedAt: '' });
    expect(component.vagas.find((v) => v.id === 5)).toBeUndefined();
  });

  it('excluir cancelado (confirm=false) não chama o back', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs')).flush({
      jobs: [{ id: 5, title: 'Pintor', type: 'CLT', isActive: true, employer: { id: 1, name: 'A' }, createdAt: '', updatedAt: '' }],
      currentPage: 1, totalPages: 1, totalRecords: 1,
    });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.excluir(component.vagas[0], { stopPropagation: () => {} } as Event);
    httpMock.expectNone((r) => r.url.endsWith('/jobs/5'));
    expect(component.vagas.length).toBe(1);
  });
});
