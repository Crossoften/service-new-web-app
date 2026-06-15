import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriaServicos } from './categoria-servicos';

describe('CategoriaServicos', () => {
  let component: CategoriaServicos;
  let fixture: ComponentFixture<CategoriaServicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaServicos],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaServicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
