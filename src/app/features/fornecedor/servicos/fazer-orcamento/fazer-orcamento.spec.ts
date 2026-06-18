import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FazerOrcamento } from './fazer-orcamento';

describe('FazerOrcamento', () => {
  let component: FazerOrcamento;
  let fixture: ComponentFixture<FazerOrcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FazerOrcamento],
    }).compileComponents();

    fixture = TestBed.createComponent(FazerOrcamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
