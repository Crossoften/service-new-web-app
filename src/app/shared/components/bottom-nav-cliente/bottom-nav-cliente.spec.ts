import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { BottomNavClienteComponent } from './bottom-nav-cliente';

describe('BottomNavClienteComponent', () => {
  let component: BottomNavClienteComponent;
  let fixture: ComponentFixture<BottomNavClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavClienteComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza a aba Mensagens (BE-Q5)', () => {
    const txt: string = fixture.nativeElement.textContent;
    expect(txt).toContain('Mensagens');
  });

  it('navega para /mensagens ao tocar na aba', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.navegar('mensagens');
    expect(nav).toHaveBeenCalledWith(['/mensagens']);
  });

  it('mostra o badge só quando há não-lidos', () => {
    component.naoLidas = 0;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-item__badge')).toBeNull();

    component.naoLidas = 5;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.nav-item__badge');
    expect(badge?.textContent?.trim()).toBe('5');
  });

  it('limita o badge a 99+', () => {
    component.naoLidas = 150;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-item__badge')?.textContent?.trim()).toBe('99+');
  });
});
