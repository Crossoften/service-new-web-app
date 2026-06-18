import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabalhosFornecedor } from './trabalhos-fornecedor';

describe('TrabalhosFornecedor', () => {
  let component: TrabalhosFornecedor;
  let fixture: ComponentFixture<TrabalhosFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabalhosFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(TrabalhosFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
