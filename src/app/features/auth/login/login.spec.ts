import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('aplica máscara de telefone quando não parece e-mail', () => {
    component.onIdentificadorInput('34998701109');
    expect(component.identificador).toBe('(34) 99870-1109');
  });

  it('não mascara quando é e-mail', () => {
    component.onIdentificadorInput('joao@email.com');
    expect(component.identificador).toBe('joao@email.com');
  });

  it('login por telefone envia E.164 no campo email', () => {
    component.onIdentificadorInput('(34) 99870-1109');
    component.senha = '12345678';
    component.entrar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/login') && r.method === 'POST');
    expect(req.request.body.email).toBe('+5534998701109');
    req.flush({ token: 't', id: 1, profileType: 'Client' });
  });

  it('login por e-mail envia o e-mail cru', () => {
    component.onIdentificadorInput('joao@email.com');
    component.senha = '12345678';
    component.entrar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/login'));
    expect(req.request.body.email).toBe('joao@email.com');
    req.flush({ token: 't', id: 1, profileType: 'Client' });
  });

  it('401 mostra mensagem genérica', () => {
    component.onIdentificadorInput('joao@email.com');
    component.senha = '12345678';
    component.entrar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/login'));
    req.flush({ message: 'Acesso não autorizado.' }, { status: 401, statusText: 'Unauthorized' });
    expect(component.erro).toContain('Acesso não autorizado');
  });

  it('reenviar código chama resend-verification com identifier', () => {
    component.onIdentificadorInput('34998701109');
    component.reenviarCodigo();
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/resend-verification') && r.method === 'POST');
    expect(req.request.body.identifier).toBe('+5534998701109');
    req.flush({ message: 'SMS enviado com sucesso!' });
    expect(component.reenvioMsg).toContain('SMS');
  });
});
