import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaEmpregos } from './categoria-empregos';

describe('CategoriaEmpregos', () => {
  let component: CategoriaEmpregos;
  let fixture: ComponentFixture<CategoriaEmpregos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaEmpregos],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaEmpregos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
