import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CardapioItemComponent } from './cardapio-item';

describe('CardapioItemComponent', () => {
  let component: CardapioItemComponent;
  let fixture: ComponentFixture<CardapioItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardapioItemComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CardapioItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
