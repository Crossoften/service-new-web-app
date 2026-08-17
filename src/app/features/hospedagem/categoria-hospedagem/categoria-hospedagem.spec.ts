import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CategoriaHospedagemComponent } from './categoria-hospedagem';

describe('CategoriaHospedagemComponent', () => {
  let component: CategoriaHospedagemComponent;
  let fixture: ComponentFixture<CategoriaHospedagemComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriaHospedagemComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriaHospedagemComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('carrega categorias de hospedagem', () => {
    httpMock
      .expectOne((r) => r.url.endsWith('/accommodations/categories'))
      .flush([{ id: 1, name: 'Hotel', slug: 'hotel', isActive: true, sortOrder: 1 }]);
    expect(component.items.length).toBe(1);
  });
});
