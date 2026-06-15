import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnderecoEntrega } from './endereco-entrega';

describe('EnderecoEntrega', () => {
  let component: EnderecoEntrega;
  let fixture: ComponentFixture<EnderecoEntrega>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnderecoEntrega],
    }).compileComponents();

    fixture = TestBed.createComponent(EnderecoEntrega);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
