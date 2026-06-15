import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavParceiro } from './bottom-nav-parceiro';

describe('BottomNavParceiro', () => {
  let component: BottomNavParceiro;
  let fixture: ComponentFixture<BottomNavParceiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavParceiro],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavParceiro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
