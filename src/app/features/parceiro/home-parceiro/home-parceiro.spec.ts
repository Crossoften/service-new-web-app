import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeParceiro } from './home-parceiro';

describe('HomeParceiro', () => {
  let component: HomeParceiro;
  let fixture: ComponentFixture<HomeParceiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeParceiro],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeParceiro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
