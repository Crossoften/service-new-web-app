import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SplashComponent } from './splash';

describe('SplashComponent', () => {
  let component: SplashComponent;
  let fixture: ComponentFixture<SplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
