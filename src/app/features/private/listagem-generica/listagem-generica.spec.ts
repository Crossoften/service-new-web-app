import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ListagemGenericaComponent } from './listagem-generica';

describe('ListagemGenericaComponent', () => {
  let component: ListagemGenericaComponent;
  let fixture: ComponentFixture<ListagemGenericaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListagemGenericaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemGenericaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
