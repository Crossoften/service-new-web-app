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

  it('should create', () => {
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({ referralCode: 'ABC123' });
    expect(component).toBeTruthy();
  });

  it('monta o link de indicação a partir do referralCode', () => {
    httpMock.expectOne((r) => r.url.endsWith('/profile/me')).flush({ referralCode: 'ABC123' });
    expect(component.codigo).toBe('ABC123');
    expect(component.link).toContain('ref=ABC123');
  });
});
