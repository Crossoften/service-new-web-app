import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RestauranteComponent } from './restaurante';

describe('RestauranteComponent', () => {
  let component: RestauranteComponent;
  let fixture: ComponentFixture<RestauranteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestauranteComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RestauranteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
