import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaisParceiro } from './mais-parceiro';

describe('MaisParceiro', () => {
  let component: MaisParceiro;
  let fixture: ComponentFixture<MaisParceiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaisParceiro],
    }).compileComponents();

    fixture = TestBed.createComponent(MaisParceiro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
