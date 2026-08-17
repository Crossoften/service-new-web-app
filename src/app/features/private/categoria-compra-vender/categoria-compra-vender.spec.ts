import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CategoriaCompraVenderComponent } from './categoria-compra-vender';

describe('CategoriaCompraVenderComponent', () => {
  let component: CategoriaCompraVenderComponent;
  let fixture: ComponentFixture<CategoriaCompraVenderComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaCompraVenderComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaCompraVenderComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega e mapeia as categorias de produto', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/products/categories'))
      .flush([
        { id: 3, name: 'Carro', slug: 'carro', iconUrl: 'x.png', isActive: true, sortOrder: 1 },
      ]);
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe(3);
    expect(component.items[0].label).toBe('Carro');
  });
});
