import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CadastroComponent } from './cadastro';

describe('CadastroComponent', () => {
  let component: CadastroComponent;
  let fixture: ComponentFixture<CadastroComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  /** Preenche os passos 1 e 2 e dispara o register. */
  function preencherEEnviar(email = '') {
    component.nome = 'João';
    component.email = email;
    component.telefone = '(34) 99870-1109';
    component.termosAceitos = true;
    component.continuar(); // step 1 → 2
    component.senha = '12345678';
    component.confirmarSenha = '12345678';
    component.continuar(); // step 2 → register
  }

  it('cadastro sem e-mail envia phone E.164 e omite email', () => {
    preencherEEnviar('');
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/register/client') && r.method === 'POST');
    expect(req.request.body.phone).toBe('+5534998701109');
    expect(req.request.body.email).toBeUndefined();
    req.flush({ message: 'ok', user: { id: 1, name: 'João', email: null, profileType: 'Client', status: 'Pending' } });
    expect(component.step).toBe(3);
    expect(component.identifier).toBe('+5534998701109');
  });

  it('inclui e-mail quando preenchido', () => {
    preencherEEnviar('joao@email.com');
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/register/client'));
    expect(req.request.body.email).toBe('joao@email.com');
    req.flush({ message: 'ok', user: { id: 1, name: 'João', email: 'joao@email.com', profileType: 'Client', status: 'Pending' } });
  });

  it('409 mostra mensagem genérica e permanece no passo 2', () => {
    preencherEEnviar('');
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/register/client'));
    req.flush({ message: 'x' }, { status: 409, statusText: 'Conflict' });
    expect(component.erro).toContain('Já existe');
    expect(component.step).toBe(2);
  });

  it('503 (SMS falhou) mostra retry e permanece no passo 2', () => {
    preencherEEnviar('');
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/register/client'));
    req.flush({ message: 'SMS indisponível' }, { status: 503, statusText: 'Service Unavailable' });
    expect(component.erro).toContain('SMS');
    expect(component.step).toBe(2);
  });

  it('verify-account envia identifier + código de 6 dígitos', () => {
    component.step = 3;
    component.identifier = '+5534998701109';
    component.codigoVerificacao = '638593';
    component.continuar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/verify-account') && r.method === 'POST');
    expect(req.request.body.identifier).toBe('+5534998701109');
    expect(req.request.body.code).toBe('638593');
    req.flush({ message: 'Conta verificada com sucesso!' });
  });

  it('rejeita código de verificação que não tem 6 dígitos', () => {
    component.step = 3;
    component.identifier = '+5534998701109';
    component.codigoVerificacao = '123';
    component.continuar();
    expect(component.erro).toContain('6 dígitos');
    httpMock.expectNone((r) => r.url.endsWith('/no-auth/verify-account'));
  });

  it('reenviar chama resend-verification e inicia contador', () => {
    component.identifier = '+5534998701109';
    component.reenviarCodigo();
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/resend-verification') && r.method === 'POST');
    expect(req.request.body.identifier).toBe('+5534998701109');
    req.flush({ message: 'SMS enviado com sucesso!' });
    expect(component.reenvioSegundos).toBeGreaterThan(0);
    component.ngOnDestroy();
  });
});
