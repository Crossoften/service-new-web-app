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

  it('cria serviço sob orçamento quando o valor fica em branco (§8.8): omite price', () => {
    component.categoryId = 3;
    component.nome = 'Consultoria';
    component.valor = '';
    component.criarServico();
    expect(component.erro).toBe('');
    const req = httpMock.expectOne((r) => r.url.endsWith('/services') && r.method === 'POST');
    expect('price' in req.request.body).toBe(false);
    req.flush({ message: 'ok', service: { id: 1 } });
  });

  it('envia a galeria como images[] com sortOrder (BE-SRV-MEDIA-1)', () => {
    component.categoryId = 3;
    component.nome = 'Reforma';
    component.galeria = [
      { fileUrl: 'https://api/v1/files/a', fileKey: 'a' },
      { fileUrl: 'https://api/v1/files/b', fileKey: 'b' },
    ];
    component.criarServico();
    const req = httpMock.expectOne((r) => r.url.endsWith('/services') && r.method === 'POST');
    expect(req.request.body.images).toEqual([
      { fileUrl: 'https://api/v1/files/a', fileKey: 'a', sortOrder: 0 },
      { fileUrl: 'https://api/v1/files/b', fileKey: 'b', sortOrder: 1 },
    ]);
    req.flush({ message: 'ok', service: { id: 1 } });
  });

  it('barra a galeria no teto de 10 imagens', () => {
    component.galeria = Array.from({ length: 10 }, (_, i) => ({ fileUrl: 'u' + i, fileKey: 'k' + i }));
    component.adicionarGaleria({ target: { files: [new File(['x'], 'f.png', { type: 'image/png' })], value: '' } } as unknown as Event);
    expect(component.erro).toContain('máximo 10');
    expect(component.galeria.length).toBe(10);
    httpMock.expectNone((r) => r.url.endsWith('/upload/one-file'));
  });
});
