import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitosServico } from './requisitos-servico';

describe('RequisitosServico', () => {
  let component: RequisitosServico;
  let fixture: ComponentFixture<RequisitosServico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisitosServico],
    }).compileComponents();

    fixture = TestBed.createComponent(RequisitosServico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
