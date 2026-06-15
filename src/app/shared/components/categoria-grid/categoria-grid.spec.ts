import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaGrid } from './categoria-grid';

describe('CategoriaGrid', () => {
  let component: CategoriaGrid;
  let fixture: ComponentFixture<CategoriaGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
