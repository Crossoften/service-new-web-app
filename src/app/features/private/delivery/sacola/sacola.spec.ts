import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SacolaComponent } from './sacola';

describe('SacolaComponent', () => {
  let component: SacolaComponent;
  let fixture: ComponentFixture<SacolaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SacolaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SacolaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
