import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBusca } from './header-busca';

describe('HeaderBusca', () => {
  let component: HeaderBusca;
  let fixture: ComponentFixture<HeaderBusca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBusca],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderBusca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
