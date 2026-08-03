import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AddCardapioComponent } from './add-cardapio';

describe('AddCardapioComponent', () => {
  let component: AddCardapioComponent;
  let fixture: ComponentFixture<AddCardapioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCardapioComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCardapioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
