import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { HomeParceiroComponent } from './home-parceiro';

describe('HomeParceiroComponent', () => {
  let component: HomeParceiroComponent;
  let fixture: ComponentFixture<HomeParceiroComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeParceiroComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeParceiroComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('mapeia summary para os stats e monta o link', () => {
    httpMock.expectOne((r) => r.url.endsWith('/referrals/me/summary')).flush({
      referralCode: 'joao',
      totalReferrals: 100,
      totalPaying: 90,
      accumulatedCommission: 500,
      rankingPosition: 24,
      effectiveCommissionRate: 10,
    });
    httpMock
      .expectOne((r) => r.url.endsWith('/referrals/me'))
      .flush({ referralCode: 'joao', referrals: [], totalRecords: 0 });

    expect(component.stats.downloads).toBe(100);
    expect(component.stats.pagantes).toBe(90);
    expect(component.stats.comissao).toBe(500);
    expect(component.stats.ranking).toBe(24);
    expect(component.link).toContain('ref=joao');
  });
});
