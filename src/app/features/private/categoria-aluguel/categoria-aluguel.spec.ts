import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaAluguel } from './categoria-aluguel';

describe('CategoriaAluguel', () => {
  let component: CategoriaAluguel;
  let fixture: ComponentFixture<CategoriaAluguel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaAluguel],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaAluguel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
