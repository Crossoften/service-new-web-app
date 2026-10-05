import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavParceiroComponent } from './bottom-nav-parceiro';

describe('BottomNavParceiroComponent', () => {
  let component: BottomNavParceiroComponent;
  let fixture: ComponentFixture<BottomNavParceiroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavParceiroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavParceiroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
