import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { RevisaoPedidoComponent } from './revisao-pedido';

describe('RevisaoPedidoComponent', () => {
  let component: RevisaoPedidoComponent;
  let fixture: ComponentFixture<RevisaoPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisaoPedidoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RevisaoPedidoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
