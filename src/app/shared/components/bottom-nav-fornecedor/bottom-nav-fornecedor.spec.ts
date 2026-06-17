import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavFornecedor } from './bottom-nav-fornecedor';

describe('BottomNavFornecedor', () => {
  let component: BottomNavFornecedor;
  let fixture: ComponentFixture<BottomNavFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
