import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { HomeFornecedorComponent } from './home-fornecedor';

describe('HomeFornecedorComponent', () => {
  let component: HomeFornecedorComponent;
  let fixture: ComponentFixture<HomeFornecedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFornecedorComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFornecedorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
