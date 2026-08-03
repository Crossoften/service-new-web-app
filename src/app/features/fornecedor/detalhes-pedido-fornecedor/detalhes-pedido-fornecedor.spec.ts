import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalhesPedidoFornecedorComponent } from './detalhes-pedido-fornecedor';

describe('DetalhesPedidoFornecedorComponent', () => {
  let component: DetalhesPedidoFornecedorComponent;
  let fixture: ComponentFixture<DetalhesPedidoFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesPedidoFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesPedidoFornecedorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
