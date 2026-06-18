import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarServico } from './criar-servico';

describe('CriarServico', () => {
  let component: CriarServico;
  let fixture: ComponentFixture<CriarServico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarServico],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarServico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
