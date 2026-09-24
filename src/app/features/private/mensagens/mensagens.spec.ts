import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MensagensComponent } from './mensagens';
import { SessionService } from '../../../core/services/session';

describe('MensagensComponent', () => {
  let component: MensagensComponent;
  let fixture: ComponentFixture<MensagensComponent>;
  let httpMock: HttpTestingController;
  let perfil: string | null;

  beforeEach(async () => {
    perfil = null;
    await TestBed.configureTestingModule({
      imports: [MensagensComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: { profileType: () => perfil, isAuthenticated: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MensagensComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  // O total do badge vem do store (refresh guardado por sessão): em teste sem
  // sessão, não há chamada a /chats/unread-count — só o inbox é buscado.
  function flush(chats: unknown[] = []) {
    httpMock.expectOne((r) => r.url.endsWith('/chats')).flush({
      chats, currentPage: 1, totalPages: 1, totalRecords: chats.length,
    });
  }

  it('carrega o inbox e mapeia a conversa', () => {
    flush([{ id: 55, contextType: 'Budget', referenceId: 9, unreadCount: 2, otherUser: { id: 9, name: 'Joelson' }, createdAt: '', updatedAt: '' }]);
    expect(component.conversas.length).toBe(1);
    expect(component.conversas[0].titulo).toBe('Joelson');
    expect(component.conversas[0].naoLidas).toBe(2);
  });

  it('lista vazia quando não há conversas', () => {
    flush([]);
    expect(component.conversas.length).toBe(0);
  });

  it('abrir navega para a sala do chat', () => {
    flush([{ id: 55, contextType: 'Budget', referenceId: 9, unreadCount: 0, otherUser: { id: 9, name: 'Joelson' }, createdAt: '', updatedAt: '' }]);
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.abrir(component.conversas[0]);
    expect(nav).toHaveBeenCalledWith(['/chat', 55]);
  });

  it('tolera falha do inbox sem quebrar', () => {
    httpMock.expectOne((r) => r.url.endsWith('/chats')).flush('x', { status: 500, statusText: 'e' });
    expect(component.carregando).toBe(false);
    expect(component.erro.length).toBeGreaterThan(0);
  });

  it('fornecedor: esconde o menu de cliente e mostra Voltar', () => {
    perfil = 'Supplier';
    fixture.detectChanges();
    flush([]);
    expect(component.isCliente).toBe(false);
    expect(fixture.nativeElement.querySelector('app-bottom-nav-cliente')).toBeNull();
    expect(fixture.nativeElement.querySelector('.msg-header__voltar')).not.toBeNull();
  });

  it('cliente: mostra o menu de cliente e esconde Voltar', () => {
    perfil = 'Client';
    fixture.detectChanges();
    flush([]);
    expect(component.isCliente).toBe(true);
    expect(fixture.nativeElement.querySelector('app-bottom-nav-cliente')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.msg-header__voltar')).toBeNull();
  });
});
