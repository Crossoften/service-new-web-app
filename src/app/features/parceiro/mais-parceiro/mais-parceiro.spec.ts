import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MaisParceiroComponent } from './mais-parceiro';
import { SessionService } from '../../../core/services/session';

describe('MaisParceiroComponent', () => {
  let component: MaisParceiroComponent;
  let fixture: ComponentFixture<MaisParceiroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaisParceiroComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MaisParceiroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('"Sair" (/login) encerra a sessão', () => {
    const session = TestBed.inject(SessionService);
    session.setSession({ token: 't', userId: 1, profileType: 'Influencer', role: null });
    component.navegar('/login');
    expect(session.isAuthenticated()).toBe(false);
  });
});
