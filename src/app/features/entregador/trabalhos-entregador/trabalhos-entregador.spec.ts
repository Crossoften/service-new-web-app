import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TrabalhosEntregadorComponent } from './trabalhos-entregador';

describe('TrabalhosEntregadorComponent', () => {
  let component: TrabalhosEntregadorComponent;
  let fixture: ComponentFixture<TrabalhosEntregadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabalhosEntregadorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TrabalhosEntregadorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
