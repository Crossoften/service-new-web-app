import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { EsqueciSenhaComponent } from './esqueci-senha';

describe('EsqueciSenhaComponent', () => {
  let component: EsqueciSenhaComponent;
  let fixture: ComponentFixture<EsqueciSenhaComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueciSenhaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueciSenhaComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('telefone → channel=sms + identifier E.164', () => {
    component.onIdentificadorInput('(34) 99870-1109');
    component.enviar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/forgot') && r.method === 'POST');
    expect(req.request.body.channel).toBe('sms');
    expect(req.request.body.identifier).toBe('+5534998701109');
    req.flush({ message: 'SMS enviado com sucesso!' });
  });

  it('e-mail → channel=email + identifier cru', () => {
    component.onIdentificadorInput('joao@email.com');
    component.enviar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/no-auth/forgot'));
    expect(req.request.body.channel).toBe('email');
    expect(req.request.body.identifier).toBe('joao@email.com');
    req.flush({ message: 'ok' });
  });

  it('valida entrada vazia', () => {
    component.enviar();
    expect(component.erro).toContain('e-mail ou telefone');
    httpMock.expectNone((r) => r.url.endsWith('/no-auth/forgot'));
  });
});
