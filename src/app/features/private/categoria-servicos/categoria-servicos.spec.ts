import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CategoriaServicosComponent } from './categoria-servicos';

describe('CategoriaServicosComponent', () => {
  let component: CategoriaServicosComponent;
  let fixture: ComponentFixture<CategoriaServicosComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaServicosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaServicosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega categorias de serviço', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/services/categories'))
      .flush([{ id: 4, name: 'Dentista', slug: 'dentista', isActive: true, sortOrder: 1 }]);
    expect(component.items.length).toBe(1);
    expect(component.items[0].id).toBe(4);
  });
});
