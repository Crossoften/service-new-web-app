import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaTransporte } from './categoria-transporte';

describe('CategoriaTransporte', () => {
  let component: CategoriaTransporte;
  let fixture: ComponentFixture<CategoriaTransporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaTransporte],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaTransporte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
