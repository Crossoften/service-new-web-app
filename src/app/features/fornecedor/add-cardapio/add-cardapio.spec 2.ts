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

  it('cadastra um adicional no item em edição (POST additions) e o adiciona à lista', () => {
    component.modoEdicao = true;
    component.itemId = 5;
    component.novoAdicionalNome = 'Bacon extra';
    component.onAdicionalValorInput('500'); // R$ 5,00
    component.adicionarAdicional();
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/restaurants/menu-items/5/additions') && r.method === 'POST',
    );
    expect(req.request.body.name).toBe('Bacon extra');
    expect(req.request.body.price).toBe(5);
    req.flush({ id: 9, name: 'Bacon extra', price: '5.00', isActive: true });
    expect(component.adicionais).toEqual([{ id: 9, nome: 'Bacon extra', valor: 5, ativo: true }]);
    expect(component.novoAdicionalNome).toBe('');
  });

  it('bloqueia adicional sem nome', () => {
    component.modoEdicao = true;
    component.itemId = 5;
    component.novoAdicionalNome = '  ';
    component.adicionarAdicional();
    expect(component.erroAdicional).toContain('nome');
    httpMock.expectNone((r) => r.url.includes('/additions'));
  });

  it('remove um adicional via PATCH isActive:false e tira da lista', () => {
    component.modoEdicao = true;
    component.itemId = 5;
    component.adicionais = [{ id: 9, nome: 'Bacon', valor: 5, ativo: true }];
    component.removerAdicional(component.adicionais[0]);
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/restaurants/menu-item-additions/9') && r.method === 'PATCH',
    );
    expect(req.request.body.isActive).toBe(false);
    req.flush({ id: 9, name: 'Bacon', price: '5.00', isActive: false });
    expect(component.adicionais).toEqual([]);
  });

  it('preço grátis quando o adicional vale 0', () => {
    expect(component.precoAdicional(0)).toBe('Grátis');
    expect(component.precoAdicional(5)).toContain('5,00');
  });
});
