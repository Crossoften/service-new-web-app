import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusPedido } from './status-pedido';

describe('StatusPedido', () => {
  let component: StatusPedido;
  let fixture: ComponentFixture<StatusPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
