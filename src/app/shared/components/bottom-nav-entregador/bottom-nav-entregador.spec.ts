import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavEntregadorComponent } from './bottom-nav-entregador';

describe('BottomNavEntregadorComponent', () => {
  let component: BottomNavEntregadorComponent;
  let fixture: ComponentFixture<BottomNavEntregadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavEntregadorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavEntregadorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
