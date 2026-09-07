import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CriarServicoComponent } from './criar-servico';

describe('CriarServicoComponent', () => {
  let component: CriarServicoComponent;
  let fixture: ComponentFixture<CriarServicoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarServicoComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarServicoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url.endsWith('/services/categories')).flush([]);
  });

  afterEach(() => httpMock.verify());

  it('exige categoria', () => {
    component.criarServico();
    expect(component.erro).toContain('categoria');
    httpMock.expectNone((r) => r.url.endsWith('/services') && r.method === 'POST');
  });

  it('exige nome quando ausente', () => {
    component.categoryId = 3;
    component.nome = '';
    component.criarServico();
    expect(component.erro).toContain('nome');
    httpMock.expectNone((r) => r.url.endsWith('/services') && r.method === 'POST');
  });

  it('renderiza o campo de nome e faz o binding com o model', async () => {
    const input: HTMLInputElement | null = fixture.nativeElement.querySelector(
      'input[placeholder="Nome do serviço"]',
    );
    expect(input).toBeTruthy();
    input!.value = 'Consultoria';
    input!.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(component.nome).toBe('Consultoria');
  });

  it('cria o serviço mapeando o tipo (Presencial → Presential)', () => {
    component.categoryId = 3;
    component.nome = 'Reforma';
    component.onValorInput('15000');
    component.tipo = 'Presencial';
    component.criarServico();
    const req = httpMock.expectOne((r) => r.url.endsWith('/services') && r.method === 'POST');
    expect(req.request.body.type).toBe('Presential');
    expect(req.request.body.categoryId).toBe(3);
    expect(req.request.body.price).toBe(150);
    req.flush({ message: 'ok', service: { id: 1 } });
  });
});
