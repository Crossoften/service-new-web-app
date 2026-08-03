import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AssinaturaFornecedorComponent } from './assinatura-fornecedor';

describe('AssinaturaFornecedorComponent', () => {
  let component: AssinaturaFornecedorComponent;
  let fixture: ComponentFixture<AssinaturaFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssinaturaFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssinaturaFornecedorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
