import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Indicacoes } from './indicacoes';

describe('Indicacoes', () => {
  let component: Indicacoes;
  let fixture: ComponentFixture<Indicacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Indicacoes],
    }).compileComponents();

    fixture = TestBed.createComponent(Indicacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
