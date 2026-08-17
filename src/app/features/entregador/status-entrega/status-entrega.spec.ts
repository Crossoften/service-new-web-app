import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StatusEntregaComponent } from './status-entrega';

describe('StatusEntregaComponent', () => {
  let component: StatusEntregaComponent;
  let fixture: ComponentFixture<StatusEntregaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusEntregaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusEntregaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
