import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CategoriaDeliveryComponent } from './categoria-delivery';

describe('CategoriaDeliveryComponent', () => {
  let component: CategoriaDeliveryComponent;
  let fixture: ComponentFixture<CategoriaDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaDeliveryComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaDeliveryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
