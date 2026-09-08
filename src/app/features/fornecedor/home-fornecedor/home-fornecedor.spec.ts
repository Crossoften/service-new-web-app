import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { HomeFornecedorComponent } from './home-fornecedor';

describe('HomeFornecedorComponent', () => {
  let component: HomeFornecedorComponent;
  let fixture: ComponentFixture<HomeFornecedorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFornecedorComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selecionarPeriodo recarrega o repasse com ?period', () => {
    component.selecionarPeriodo('week');
    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/restaurants/me/payouts') && r.params.get('period') === 'week',
    );
    req.flush({
      billingType: 'Commission',
      totalOrders: 3,
      totalItemsValue: '100',
      totalCommission: '10',
      netAmount: '90',
      period: 'week',
    });
    expect(component.periodoPayout).toBe('week');
    expect(component.payout?.period).toBe('week');
  });
});
