import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesTrabalho } from './detalhes-trabalho';

describe('DetalhesTrabalho', () => {
  let component: DetalhesTrabalho;
  let fixture: ComponentFixture<DetalhesTrabalho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesTrabalho],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesTrabalho);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
