import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  it('não renderiza nada quando fechado', () => {
    component.aberto = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cd-modal')).toBeNull();
  });

  it('emite confirmar e fechar', () => {
    component.aberto = true;
    fixture.detectChanges();
    let confirmou = false;
    let fechou = false;
    component.confirmar.subscribe(() => (confirmou = true));
    component.fechar.subscribe(() => (fechou = true));
    const botoes: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.cd-btn'));
    botoes.find((b) => b.classList.contains('cd-btn--danger'))!.click();
    botoes.find((b) => b.classList.contains('cd-btn--ghost'))!.click();
    expect(confirmou).toBe(true);
    expect(fechou).toBe(true);
  });

  it('bloqueia os botões enquanto processando', () => {
    component.aberto = true;
    component.processando = true;
    fixture.detectChanges();
    const botoes: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('.cd-btn'));
    expect(botoes.every((b) => b.disabled)).toBe(true);
  });
});
