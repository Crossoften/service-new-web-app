import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EsqueciSenhaComponent } from './esqueci-senha';

describe('EsqueciSenhaComponent', () => {
  let component: EsqueciSenhaComponent;
  let fixture: ComponentFixture<EsqueciSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsqueciSenhaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueciSenhaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
