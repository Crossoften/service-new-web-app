import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RestauranteFornecedorComponent } from './restaurante-fornecedor';

describe('RestauranteFornecedorComponent', () => {
  let component: RestauranteFornecedorComponent;
  let fixture: ComponentFixture<RestauranteFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestauranteFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RestauranteFornecedorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
