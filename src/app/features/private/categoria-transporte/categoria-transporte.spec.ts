import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CategoriaTransporteComponent } from './categoria-transporte';

describe('CategoriaTransporteComponent', () => {
  let component: CategoriaTransporteComponent;
  let fixture: ComponentFixture<CategoriaTransporteComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaTransporteComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaTransporteComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega as categorias de transporte', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/transportations/categories'))
      .flush([{ id: 1, name: 'Caminhão', slug: 'caminhao', isActive: true, sortOrder: 1 }]);
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe(1);
  });
});
