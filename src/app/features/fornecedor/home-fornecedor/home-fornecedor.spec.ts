import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeFornecedor } from './home-fornecedor';

describe('HomeFornecedor', () => {
  let component: HomeFornecedor;
  let fixture: ComponentFixture<HomeFornecedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFornecedor],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFornecedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
