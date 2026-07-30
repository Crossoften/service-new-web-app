import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusEntrega } from './status-entrega';

describe('StatusEntrega', () => {
  let component: StatusEntrega;
  let fixture: ComponentFixture<StatusEntrega>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusEntrega],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusEntrega);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
