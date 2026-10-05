import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaEmpregosComponent } from './categoria-empregos';

describe('CategoriaEmpregosComponent', () => {
  let component: CategoriaEmpregosComponent;
  let fixture: ComponentFixture<CategoriaEmpregosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaEmpregosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaEmpregosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
