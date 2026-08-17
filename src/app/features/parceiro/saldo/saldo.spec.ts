import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SaldoComponent } from './saldo';

describe('SaldoComponent', () => {
  let component: SaldoComponent;
  let fixture: ComponentFixture<SaldoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaldoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SaldoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega saldo do mês, histórico e conta bancária', () => {
    httpMock.expectOne((r) => r.url.endsWith('/balances/receipts')).flush({
      currentMonthBalance: '2000.00',
      recentReceipts: [
        { id: 1, amount: '350.00', description: 'Pgto', createdAt: '', payer: { id: 2, name: 'Ana' } },
      ],
    });
    httpMock.expectOne((r) => r.url.endsWith('/bank-accounts/me')).flush({
      id: 5, bankName: 'Itaú', accountType: 'Checking', agency: '0000', account: '111', cpf: '000', userId: 1, createdAt: '', updatedAt: '',
    });

    expect(component.saldoMes).toBe(2000);
    expect(component.historico.length).toBe(1);
    expect(component.bancos.length).toBe(1);
    expect(component.bancos[0].tipo).toBe('Conta corrente');
  });
});
