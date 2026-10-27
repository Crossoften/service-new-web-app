import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { MeuCodigoComponent } from './meu-codigo';

describe('MeuCodigoComponent', () => {
  let component: MeuCodigoComponent;
  let fixture: ComponentFixture<MeuCodigoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeuCodigoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MeuCodigoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  /** O código vem dos endpoints de referral (summary + lista). */
  function flushReferrals(summaryCode: unknown, listaCode: unknown = null) {
    httpMock.expectOne((r) => r.url.endsWith('/referrals/me/summary')).flush({
      referralCode: summaryCode, totalReferrals: 0, totalPaying: 0,
      accumulatedCommission: 0, rankingPosition: 0, effectiveCommissionRate: 0,
    });
    httpMock.expectOne((r) => r.url.endsWith('/referrals/me')).flush({
      referralCode: listaCode, referrals: [], totalRecords: 0,
    });
  }

  it('should create', () => {
    flushReferrals('ABC123');
    expect(component).toBeTruthy();
  });

  it('monta o link de indicação a partir do referralCode do summary', () => {
    flushReferrals('ABC123');
    expect(component.codigo).toBe('ABC123');
    expect(component.link).toContain('ref=ABC123');
  });

  it('cai no referralCode da lista quando o summary não traz', () => {
    flushReferrals(null, 'XYZ789');
    expect(component.codigo).toBe('XYZ789');
    expect(component.link).toContain('ref=XYZ789');
  });

  it('sem código → sem link (estado vazio)', () => {
    flushReferrals(null, null);
    expect(component.codigo).toBe('');
    expect(component.link).toBe('');
  });
});
