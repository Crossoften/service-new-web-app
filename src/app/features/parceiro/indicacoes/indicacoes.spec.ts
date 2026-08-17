import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { IndicacoesComponent } from './indicacoes';

describe('IndicacoesComponent', () => {
  let component: IndicacoesComponent;
  let fixture: ComponentFixture<IndicacoesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicacoesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(IndicacoesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('separa ativas (Convertido) de inativas', () => {
    httpMock.expectOne((r) => r.url.endsWith('/referrals/me')).flush({
      referrals: [
        { id: 1, status: 'Convertido', createdAt: '', referredUser: { id: 9, name: 'A', email: 'a@e', profileType: 'Client', status: 'Active', registeredAt: '' } },
        { id: 2, status: 'Aguardando Pagamento', createdAt: '', referredUser: { id: 10, name: 'B', email: 'b@e', profileType: 'Supplier', status: 'Pending', registeredAt: '' } },
      ],
      totalRecords: 2,
    });
    expect(component.indicacoes.length).toBe(2);
    component.tabAtiva = 'ativas';
    expect(component.indicacoesFiltradas.length).toBe(1);
    component.tabAtiva = 'inativas';
    expect(component.indicacoesFiltradas.length).toBe(1);
  });
});
