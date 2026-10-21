import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { VideoUploadComponent } from './video-upload';
import { UploadService } from '../../../core/services/upload';

describe('VideoUploadComponent', () => {
  let component: VideoUploadComponent;
  let fixture: ComponentFixture<VideoUploadComponent>;
  let uploads: UploadService;

  const evt = (file: File) =>
    ({ target: { files: [file], value: '' } }) as unknown as Event;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoUploadComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(VideoUploadComponent);
    component = fixture.componentInstance;
    uploads = TestBed.inject(UploadService);
  });

  it('envia o vídeo e emite {url,key}', () => {
    vi.spyOn(uploads, 'validarVideo').mockReturnValue(null);
    vi.spyOn(uploads, 'enviarVideo').mockReturnValue(of({ id: 9, fileUrl: 'https://api/v1/files/k', fileKey: 'k' }));
    const emitido: { url: string; key: string }[] = [];
    component.changed.subscribe((v) => emitido.push(v));

    component.selecionar(evt(new File(['x'], 'v.mp4', { type: 'video/mp4' })));

    expect(emitido).toEqual([{ url: 'https://api/v1/files/k', key: 'k' }]);
    expect(component.url).toBe('https://api/v1/files/k');
    expect(component.enviando).toBe(false);
  });

  it('recusa vídeo inválido sem enviar', () => {
    vi.spyOn(uploads, 'validarVideo').mockReturnValue('Formato de vídeo não suportado.');
    const enviar = vi.spyOn(uploads, 'enviarVideo');
    component.selecionar(evt(new File(['x'], 'f.png', { type: 'image/png' })));
    expect(component.erro).toContain('não suportado');
    expect(enviar).not.toHaveBeenCalled();
  });

  it('erro no upload é exibido', () => {
    vi.spyOn(uploads, 'validarVideo').mockReturnValue(null);
    vi.spyOn(uploads, 'enviarVideo').mockReturnValue(throwError(() => ({ status: 500, message: 'Falhou' })));
    component.selecionar(evt(new File(['x'], 'v.mp4', { type: 'video/mp4' })));
    expect(component.erro).toBe('Falhou');
    expect(component.enviando).toBe(false);
  });

  it('remover limpa a url e emite vazio', () => {
    component.url = 'https://api/v1/files/k';
    const emitido: { url: string; key: string }[] = [];
    component.changed.subscribe((v) => emitido.push(v));
    component.remover();
    expect(component.url).toBe('');
    expect(emitido).toEqual([{ url: '', key: '' }]);
  });
});
