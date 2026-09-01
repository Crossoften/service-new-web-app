import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { RedefinirSenhaComponent } from './redefinir-senha';

describe('RedefinirSenhaComponent', () => {
  let component: RedefinirSenhaComponent;
  let fixture: ComponentFixture<RedefinirSenhaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedefinirSenhaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RedefinirSenhaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reset envia identifier + código de 6 dígitos', () => {
    component.identifier = '+5534998701109';
    component.codigo = '123456';
    component.senha = 'novaSenha1';
    component.confirmarSenha = 'novaSenha1';
    component.redefinir();
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/reset') && r.method === 'POST');
    expect(req.request.body.identifier).toBe('+5534998701109');
    expect(req.request.body.code).toBe('123456');
    expect(req.request.body.password).toBe('novaSenha1');
    req.flush({ message: 'ok' });
  });

  it('input OTP monta o código (digitação e colagem)', () => {
    ['1', '2', '3', '4', '5', '6'].forEach((d, i) => {
      component.onOtpInput({ target: { value: d } } as unknown as Event, i);
    });
    expect(component.codigo).toBe('123456');
    component.digitos = ['', '', '', '', '', ''];
    component.onOtpPaste({
      preventDefault: () => {},
      clipboardData: { getData: () => '987654' },
    } as unknown as ClipboardEvent);
    expect(component.codigo).toBe('987654');
  });

  it('rejeita código que não tem 6 dígitos', () => {
    component.identifier = '+5534998701109';
    component.codigo = '1234';
    component.senha = 'novaSenha1';
    component.confirmarSenha = 'novaSenha1';
    component.redefinir();
    expect(component.erro).toContain('6 dígitos');
    httpMock.expectNone((r) => r.url.endsWith('/no-auth/reset'));
  });

  it('exige identifier carregado da tela anterior', () => {
    component.identifier = '';
    component.codigo = '123456';
    component.senha = 'novaSenha1';
    component.confirmarSenha = 'novaSenha1';
    component.redefinir();
    expect(component.erro).toContain('expirada');
    httpMock.expectNone((r) => r.url.endsWith('/no-auth/reset'));
  });
});
