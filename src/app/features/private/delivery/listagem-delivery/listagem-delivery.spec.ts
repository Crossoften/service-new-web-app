import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ListagemDeliveryComponent } from './listagem-delivery';

describe('ListagemDeliveryComponent', () => {
  let component: ListagemDeliveryComponent;
  let fixture: ComponentFixture<ListagemDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemDeliveryComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemDeliveryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
