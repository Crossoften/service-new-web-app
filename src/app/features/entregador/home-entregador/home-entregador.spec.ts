import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeEntregadorComponent } from './home-entregador';

describe('HomeEntregadorComponent', () => {
  let component: HomeEntregadorComponent;
  let fixture: ComponentFixture<HomeEntregadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEntregadorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEntregadorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
