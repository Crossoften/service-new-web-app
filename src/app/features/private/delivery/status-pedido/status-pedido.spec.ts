import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StatusPedidoComponent } from './status-pedido';

describe('StatusPedidoComponent', () => {
  let component: StatusPedidoComponent;
  let fixture: ComponentFixture<StatusPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPedidoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPedidoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
