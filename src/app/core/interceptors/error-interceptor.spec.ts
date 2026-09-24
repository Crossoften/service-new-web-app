import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { errorInterceptor } from './error-interceptor';
import { SessionService } from '../services/session';
import { ApiError } from '../models/common';

const SUB_MSG = 'É necessário ter uma assinatura ativa desta categoria para realizar esta operação.';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let nav: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    nav = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => httpMock.verify());

  /** Dispara um GET, responde com erro e devolve o ApiError normalizado. */
  function falhar(url: string, status: number, body: object): ApiError {
    let captured: ApiError | undefined;
    http.get(url).subscribe({ next: () => undefined, error: (e: ApiError) => (captured = e) });
    httpMock.expectOne(url).flush(body, { status, statusText: 'x' });
    return captured as ApiError;
  }

  it('401 limpa a sessão e vai para o login', () => {
    const clear = vi.spyOn(TestBed.inject(SessionService), 'clear');
    falhar('/my-self', 401, { message: 'expirou' });
    expect(clear).toHaveBeenCalled();
    expect(nav).toHaveBeenCalledWith(['/login']);
  });

  it('403 de assinatura com categoryId leva à categoria certa', () => {
    falhar('/works', 403, { statusCode: 403, message: SUB_MSG, categoryId: 1 });
    expect(nav).toHaveBeenCalledWith(['/fornecedor/assinatura'], { queryParams: { categoryId: 1 } });
  });

  it('403 de assinatura sem categoryId cai na tela genérica', () => {
    falhar('/works', 403, { statusCode: 403, message: SUB_MSG });
    expect(nav).toHaveBeenCalledWith(['/fornecedor/assinatura'], {});
  });

  it('403 de assinatura vindo da própria rota de subscriptions não redireciona', () => {
    falhar('/subscriptions/catalog', 403, { message: SUB_MSG, categoryId: 1 });
    expect(nav).not.toHaveBeenCalled();
  });

  it('403 genérico (sem mensagem de assinatura) não redireciona', () => {
    falhar('/works', 403, { message: 'Sem permissão' });
    expect(nav).not.toHaveBeenCalled();
  });

  it('normaliza a mensagem do corpo em 400', () => {
    const err = falhar('/works', 400, { message: 'Campo inválido' });
    expect(err.message).toBe('Campo inválido');
    expect(err.status).toBe(400);
    expect(nav).not.toHaveBeenCalled();
  });
});
