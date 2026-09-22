import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { NovoBancoComponent } from './novo-banco';

describe('NovoBancoComponent', () => {
  let component: NovoBancoComponent;
  let fixture: ComponentFixture<NovoBancoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoBancoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoBancoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('valida campos obrigatórios antes de enviar', () => {
    component.salvar();
    expect(component.erro).toContain('agência');
    httpMock.expectNone((r) => r.url.endsWith('/bank-accounts'));
  });

  it('envia CreateBankAccountDto com accountType mapeado', () => {
    component.agencia = '0001';
    component.conta = '12345';
    component.cpf = '123.456.789-01';
    component.tipoSelecionado = 'Conta poupança';
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/bank-accounts'));
    expect(req.request.body.accountType).toBe('Savings');
    expect(req.request.body.cpf).toBe('12345678901');
    // Sem Pix → não envia os campos.
    expect('pixKey' in req.request.body).toBe(false);
    expect('pixKeyType' in req.request.body).toBe(false);
    req.flush({ message: 'ok', bankAccount: { id: 1 } });
  });

  it('envia pixKeyType + pixKey quando ambos preenchidos (§8.5)', () => {
    component.agencia = '0001';
    component.conta = '12345';
    component.cpf = '12345678901';
    component.selecionarPixTipo('Email');
    component.pixChave = 'maria@email.com';
    component.salvar();
    const req = httpMock.expectOne((r) => r.url.endsWith('/bank-accounts'));
    expect(req.request.body.pixKeyType).toBe('Email');
    expect(req.request.body.pixKey).toBe('maria@email.com');
    req.flush({ message: 'ok', bankAccount: { id: 1 } });
  });

  it('bloqueia Pix com só um dos dois campos (andam juntos → evita 400)', () => {
    component.agencia = '0001';
    component.conta = '12345';
    component.cpf = '12345678901';
    component.selecionarPixTipo('Cpf');
    component.pixChave = ''; // tipo sem chave
    component.salvar();
    expect(component.erro.toLowerCase()).toContain('pix');
    httpMock.expectNone((r) => r.url.endsWith('/bank-accounts'));
  });
});
