import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovarOrcamento } from './aprovar-orcamento';

describe('AprovarOrcamento', () => {
  let component: AprovarOrcamento;
  let fixture: ComponentFixture<AprovarOrcamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovarOrcamento],
    }).compileComponents();

    fixture = TestBed.createComponent(AprovarOrcamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
