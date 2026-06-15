import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoBanco } from './novo-banco';

describe('NovoBanco', () => {
  let component: NovoBanco;
  let fixture: ComponentFixture<NovoBanco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoBanco],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoBanco);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
