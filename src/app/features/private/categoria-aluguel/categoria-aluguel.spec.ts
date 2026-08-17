import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CategoriaAluguelComponent } from './categoria-aluguel';

describe('CategoriaAluguelComponent', () => {
  let component: CategoriaAluguelComponent;
  let fixture: ComponentFixture<CategoriaAluguelComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaAluguelComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaAluguelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega as categorias de produto', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/products/categories'))
      .flush([{ id: 3, name: 'Carro', slug: 'carro', isActive: true, sortOrder: 1 }]);
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe(3);
  });
});
