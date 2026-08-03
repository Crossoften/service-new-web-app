import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PedidosDeliveryComponent } from './pedidos-delivery';

describe('PedidosDeliveryComponent', () => {
  let component: PedidosDeliveryComponent;
  let fixture: ComponentFixture<PedidosDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosDeliveryComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosDeliveryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
