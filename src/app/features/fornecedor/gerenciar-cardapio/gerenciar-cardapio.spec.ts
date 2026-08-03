import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { GerenciarCardapioComponent } from './gerenciar-cardapio';

describe('GerenciarCardapioComponent', () => {
  let component: GerenciarCardapioComponent;
  let fixture: ComponentFixture<GerenciarCardapioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarCardapioComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarCardapioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
