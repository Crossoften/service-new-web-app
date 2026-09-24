import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BottomNavClienteComponent } from './bottom-nav-cliente';
import { ChatUnreadStore } from '../../../core/services/chat-unread-store';

describe('BottomNavClienteComponent', () => {
  let component: BottomNavClienteComponent;
  let fixture: ComponentFixture<BottomNavClienteComponent>;
  let store: ChatUnreadStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavClienteComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavClienteComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(ChatUnreadStore);
    fixture.detectChanges();
  });

  it('renderiza a aba Mensagens (BE-Q5)', () => {
    expect((fixture.nativeElement.textContent as string)).toContain('Mensagens');
  });

  it('navega para /mensagens ao tocar na aba', () => {
    const nav = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.navegar('mensagens');
    expect(nav).toHaveBeenCalledWith(['/mensagens']);
  });

  it('mostra o badge só quando o store tem não-lidos', () => {
    store.zerar();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-item__badge')).toBeNull();

    store.definir(5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-item__badge')?.textContent?.trim()).toBe('5');
  });

  it('limita o badge a 99+', () => {
    store.definir(150);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nav-item__badge')?.textContent?.trim()).toBe('99+');
  });
});
