import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EnderecoEntregaComponent } from './endereco-entrega';

describe('EnderecoEntregaComponent', () => {
  let component: EnderecoEntregaComponent;
  let fixture: ComponentFixture<EnderecoEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnderecoEntregaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EnderecoEntregaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
