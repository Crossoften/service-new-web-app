import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisaoPedido } from './revisao-pedido';

describe('RevisaoPedido', () => {
  let component: RevisaoPedido;
  let fixture: ComponentFixture<RevisaoPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisaoPedido],
    }).compileComponents();

    fixture = TestBed.createComponent(RevisaoPedido);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
