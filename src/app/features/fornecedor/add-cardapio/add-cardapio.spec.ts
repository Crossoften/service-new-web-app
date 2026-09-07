import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AddCardapioComponent } from './add-cardapio';

describe('AddCardapioComponent', () => {
  let component: AddCardapioComponent;
  let fixture: ComponentFixture<AddCardapioComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCardapioComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCardapioComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // Sem detectChanges: evita o ngOnInit (carregamento de categorias).
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mascara o valor como moeda enquanto digita', () => {
    component.onValorInput('1250');
    expect(component.valor).toBe('R$ 12,50');
    component.onValorInput('R$ 12,505');
    expect(component.valor).toBe('R$ 125,05');
  });

  it('salva enviando o preço numérico a partir da máscara', () => {
    component.nome = 'Pizza';
    component.descricao = 'Grande';
    component.onValorInput('4500'); // R$ 45,00
    component.categoriaSelecionadaId = 3;
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/restaurants/menu-items') && r.method === 'POST');
    expect(req.request.body.price).toBe(45);
    expect(req.request.body.menuCategoryId).toBe(3);
    req.flush({});
  });

  it('bloqueia salvar com valor zerado', () => {
    component.nome = 'Pizza';
    component.descricao = 'Grande';
    component.valor = '';
    component.categoriaSelecionadaId = 3;
    component.salvar();
    expect(component.erro).toContain('valor');
    httpMock.expectNone((r) => r.url.endsWith('/restaurants/menu-items'));
  });

  it('faz upload da imagem selecionada e guarda a URL', () => {
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.selecionarArquivo(event);
    const req = httpMock.expectOne((r) => r.url.endsWith('/upload/one-file') && r.method === 'POST');
    req.flush({ fileUrl: 'https://cdn/foto.png', fileKey: 'k1' });
    expect(component.arquivo).toBe('https://cdn/foto.png');
  });
});
