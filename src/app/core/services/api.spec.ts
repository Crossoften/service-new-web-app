import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ApiService } from './api';

describe('ApiService — upload (§8.14)', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('uploadOne envia multipart para /upload/one-file (arquivo não-HEIC passa direto)', async () => {
    const f = new File([new Blob(['x'])], 'foto.jpg', { type: 'image/jpeg' });
    service.uploadOne(f).subscribe();
    await new Promise((r) => setTimeout(r)); // from(Promise) resolve no microtask

    const req = httpMock.expectOne((r) => r.url.endsWith('/upload/one-file') && r.method === 'POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBeInstanceOf(File);
    req.flush({ id: 1, fileUrl: 'u', fileKey: 'k' });
  });

  it('uploadMany envia múltiplos no campo files', async () => {
    const a = new File([new Blob(['a'])], 'a.png', { type: 'image/png' });
    const b = new File([new Blob(['b'])], 'b.png', { type: 'image/png' });
    service.uploadMany([a, b]).subscribe();
    await new Promise((r) => setTimeout(r));

    const req = httpMock.expectOne((r) => r.url.endsWith('/upload/many-files') && r.method === 'POST');
    expect((req.request.body as FormData).getAll('files').length).toBe(2);
    req.flush([{ id: 1, fileUrl: 'u', fileKey: 'k' }]);
  });
});
