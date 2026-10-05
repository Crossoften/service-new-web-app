import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ChatComponent } from './chat';
import { SessionService } from '../../../core/services/session';
import { UploadService } from '../../../core/services/upload';
import { of } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
      ],
    }).compileComponents();

    TestBed.inject(SessionService).setSession({ token: 't', userId: 2, profileType: 'Client', role: null });

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy(); // limpa o setInterval do polling
    httpMock.verify();
    TestBed.inject(SessionService).clear();
  });

  function flushCarga() {
    httpMock.expectOne((r) => r.url.endsWith('/chats/1/messages')).flush({
      chat: { id: 1, contextType: 'Rental', referenceId: 5, otherUser: { id: 3, name: 'Bob' }, createdAt: '', updatedAt: '' },
      messages: [
        { id: 2, message: 'Oi', sender: { id: 3, name: 'Bob' }, createdAt: '2026-01-01T10:01:00Z', updatedAt: '' },
        { id: 1, message: 'Olá', sender: { id: 2, name: 'Ana' }, createdAt: '2026-01-01T10:00:00Z', updatedAt: '' },
      ],
      currentPage: 1, totalPages: 1, totalRecords: 2,
    });
    httpMock.expectOne((r) => r.url.endsWith('/chats/1/read')).flush({});
  }

  it('carrega mensagens ordenadas e identifica o remetente', () => {
    flushCarga();
    expect(component.mensagens.length).toBe(2);
    expect(component.mensagens[0].id).toBe(1); // ordenado por data asc
    expect(component.outroNome).toBe('Bob');
    expect(component.souRemetente(component.mensagens[0])).toBe(true); // sender 2 = eu
    expect(component.souRemetente(component.mensagens[1])).toBe(false);
  });

  it('envia mensagem (POST) e recarrega', () => {
    flushCarga();
    component.novaMensagem = 'Nova';
    component.enviar();
    const post = httpMock.expectOne((r) => r.url.endsWith('/chats/1/messages') && r.method === 'POST');
    expect(post.request.body.message).toBe('Nova');
    post.flush({});
    // recarrega mensagens após enviar
    httpMock.expectOne((r) => r.url.endsWith('/chats/1/messages') && r.method === 'GET').flush({
      chat: { id: 1, contextType: 'Rental', referenceId: 5, createdAt: '', updatedAt: '' },
      messages: [], currentPage: 1, totalPages: 1, totalRecords: 0,
    });
    expect(component.novaMensagem).toBe('');
  });

  it('ehVideo detecta pela extensão do arquivo/URL', () => {
    flushCarga();
    expect(component.ehVideo({ fileName: 'obra.mp4' } as never)).toBe(true);
    expect(component.ehVideo({ fileUrl: 'https://api/v1/files/123-x.mov' } as never)).toBe(true);
    expect(component.ehVideo({ fileName: 'doc.pdf' } as never)).toBe(false);
    expect(component.ehVideo({} as never)).toBe(false);
  });

  it('envia vídeo como mensagem (upload → POST com fileUrl/fileKey) e recarrega', () => {
    flushCarga();
    const up = TestBed.inject(UploadService);
    vi.spyOn(up, 'validarVideo').mockReturnValue(null);
    vi.spyOn(up, 'enviarVideo').mockReturnValue(of({ id: 9, fileUrl: 'https://api/v1/files/k', fileKey: 'k' }));

    const file = new File(['x'], 'v.mp4', { type: 'video/mp4' });
    component.selecionarVideo({ target: { files: [file], value: '' } } as unknown as Event);

    const post = httpMock.expectOne((r) => r.url.endsWith('/chats/1/messages') && r.method === 'POST');
    expect(post.request.body).toEqual({ message: undefined, fileName: 'v.mp4', fileUrl: 'https://api/v1/files/k', fileKey: 'k' });
    post.flush({});
    httpMock.expectOne((r) => r.url.endsWith('/chats/1/messages') && r.method === 'GET').flush({
      chat: { id: 1, contextType: 'Rental', referenceId: 5, createdAt: '', updatedAt: '' },
      messages: [], currentPage: 1, totalPages: 1, totalRecords: 0,
    });
    expect(component.enviandoVideo).toBe(false);
  });

  it('recusa vídeo inválido no chat sem enviar', () => {
    flushCarga();
    const up = TestBed.inject(UploadService);
    const enviar = vi.spyOn(up, 'enviarVideo');
    component.selecionarVideo({ target: { files: [new File(['x'], 'f.png', { type: 'image/png' })], value: '' } } as unknown as Event);
    expect(component.erro).toContain('não suportado');
    expect(enviar).not.toHaveBeenCalled();
  });
});
