import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardapioItem } from './cardapio-item';

describe('CardapioItem', () => {
  let component: CardapioItem;
  let fixture: ComponentFixture<CardapioItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardapioItem],
    }).compileComponents();

    fixture = TestBed.createComponent(CardapioItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
