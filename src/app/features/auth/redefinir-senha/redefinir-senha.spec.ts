import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RedefinirSenhaComponent } from './redefinir-senha';

describe('RedefinirSenhaComponent', () => {
  let component: RedefinirSenhaComponent;
  let fixture: ComponentFixture<RedefinirSenhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedefinirSenhaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RedefinirSenhaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
