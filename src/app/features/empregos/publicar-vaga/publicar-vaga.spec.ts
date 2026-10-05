import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { PublicarVagaComponent } from './publicar-vaga';

describe('PublicarVagaComponent', () => {
  let component: PublicarVagaComponent;
  let fixture: ComponentFixture<PublicarVagaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarVagaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicarVagaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('exige título', () => {
    component.salvar();
    expect(component.erro).toContain('título');
    httpMock.expectNone((r) => r.url.endsWith('/jobs'));
  });

  it('publica a vaga (POST /jobs)', () => {
    component.titulo = 'Dev Back-end';
    component.tipo = 'PJ';
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs') && r.method === 'POST');
    expect(req.request.body.title).toBe('Dev Back-end');
    expect(req.request.body.type).toBe('PJ');
    req.flush({ message: 'ok', job: { id: 1 } });
  });
});

describe('PublicarVagaComponent (edição)', () => {
  let component: PublicarVagaComponent;
  let fixture: ComponentFixture<PublicarVagaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicarVagaComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicarVagaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega a vaga e preenche o form (GET /jobs/:id)', () => {
    const req = httpMock.expectOne((r) => r.url.endsWith('/jobs/7') && r.method === 'GET');
    req.flush({ id: 7, title: 'Pintor', type: 'Freelance', value: '1500.00', requirements: 'Exp.', description: 'Obra', isActive: true, employer: { id: 2, name: 'Alpha' }, createdAt: '', updatedAt: '' });
    expect(component.editId).toBe(7);
    expect(component.titulo).toBe('Pintor');
    expect(component.tipo).toBe('Freelance');
    expect(component.valor).toBe(1500);
    expect(component.tituloTela).toBe('Editar vaga');
  });

  it('salva alterações com PATCH /jobs/:id', () => {
    httpMock.expectOne((r) => r.url.endsWith('/jobs/7') && r.method === 'GET').flush({ id: 7, title: 'Pintor', type: 'CLT', isActive: true, employer: { id: 2, name: 'Alpha' }, createdAt: '', updatedAt: '' });
    component.titulo = 'Pintor Sênior';
    component.salvar();
    const patch = httpMock.expectOne((r) => r.url.endsWith('/jobs/7') && r.method === 'PATCH');
    expect(patch.request.body.title).toBe('Pintor Sênior');
    patch.flush({ id: 7, title: 'Pintor Sênior', type: 'CLT', isActive: true, employer: { id: 2, name: 'Alpha' }, createdAt: '', updatedAt: '' });
  });
});
