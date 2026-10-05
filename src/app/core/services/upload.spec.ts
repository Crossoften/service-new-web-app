import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom, of } from 'rxjs';

import { UploadService } from './upload';
import { SessionService } from './session';
import { MAX_VIDEO_BYTES, ResponsePresignUploadDto } from '../models/upload';

function videoFile(type = 'video/mp4', size = 10): File {
  const f = new File([new Blob(['x'])], 'v.mp4', { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

function presign(over: Partial<ResponsePresignUploadDto> = {}): ResponsePresignUploadDto {
  return {
    strategy: 's3',
    uploadUrl: 'https://bkt.s3.amazonaws.com/',
    fields: { key: 'k', Policy: 'p', 'X-Amz-Signature': 's' },
    fileKey: 'k1',
    token: 'tok',
    maxBytes: MAX_VIDEO_BYTES,
    expiresIn: 900,
    previewUrl: 'https://api/v1/files/k1',
    ...over,
  };
}

describe('UploadService — vídeo (§8.14)', () => {
  let service: UploadService;
  let httpMock: HttpTestingController;
  let token: string | null;

  beforeEach(() => {
    token = 'JWT';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionService, useValue: { token: () => token } },
      ],
    });
    service = TestBed.inject(UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  it('presign faz POST /upload/presign', () => {
    service.presign({ fileName: 'v.mp4', contentType: 'video/mp4' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/upload/presign') && r.method === 'POST');
    expect(req.request.body).toEqual({ fileName: 'v.mp4', contentType: 'video/mp4' });
    req.flush(presign());
  });

  it('confirm faz POST /upload/confirm', () => {
    service.confirm({ fileKey: 'k1', token: 'tok' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/upload/confirm') && r.method === 'POST');
    req.flush({ id: 1, fileUrl: 'u', fileKey: 'k1' });
  });

  it('validarVideo recusa tipo e tamanho', () => {
    expect(service.validarVideo(videoFile('image/png'))).toContain('não suportado');
    expect(service.validarVideo(videoFile('video/mp4', MAX_VIDEO_BYTES + 1))).toContain('200 MB');
    expect(service.validarVideo(videoFile('video/mp4', 10))).toBeNull();
  });

  it('enviarVideo (s3): presign → fetch SEM Authorization → confirm', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(service, 'presign').mockReturnValue(of(presign({ strategy: 's3' })));
    vi.spyOn(service, 'confirm').mockReturnValue(of({ id: 9, fileUrl: 'https://api/v1/files/k1', fileKey: 'k1' }));

    const res = await firstValueFrom(service.enviarVideo(videoFile()));
    expect(res.fileUrl).toBe('https://api/v1/files/k1');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://bkt.s3.amazonaws.com/');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBeUndefined(); // s3 → sem Bearer
    const body = init.body as FormData;
    expect(body.get('key')).toBe('k');
    expect(body.get('file')).toBeInstanceOf(File);
    expect(service.confirm).toHaveBeenCalledWith({ fileKey: 'k1', token: 'tok' });
  });

  it('enviarVideo (api): fetch COM Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(service, 'presign').mockReturnValue(of(presign({ strategy: 'api', fields: {} })));
    vi.spyOn(service, 'confirm').mockReturnValue(of({ id: 9, fileUrl: 'u', fileKey: 'k1' }));

    await firstValueFrom(service.enviarVideo(videoFile()));
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer JWT');
  });

  it('enviarVideo propaga erro de autorização expirada (403 no envio)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    vi.spyOn(service, 'presign').mockReturnValue(of(presign()));
    const confirmSpy = vi.spyOn(service, 'confirm');

    await expect(firstValueFrom(service.enviarVideo(videoFile()))).rejects.toThrow('expirou');
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('enviarVideo rejeita antes do presign quando o tipo é inválido', async () => {
    const presignSpy = vi.spyOn(service, 'presign');
    await expect(firstValueFrom(service.enviarVideo(videoFile('image/png')))).rejects.toThrow('não suportado');
    expect(presignSpy).not.toHaveBeenCalled();
  });
});
