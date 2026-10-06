import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatChipsComponent } from './stat-chips';

describe('StatChipsComponent', () => {
  let fixture: ComponentFixture<StatChipsComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatChipsComponent] }).compileComponents();
    fixture = TestBed.createComponent(StatChipsComponent);
    el = fixture.nativeElement as HTMLElement;
  });

  it('mostra positivas e negativas; sem extra não renderiza o 3º chip', () => {
    fixture.componentInstance.positivas = 48;
    fixture.componentInstance.negativas = 3;
    fixture.detectChanges();
    const chips = el.querySelectorAll('.stat-chips__chip');
    expect(chips.length).toBe(2);
    expect(el.textContent).toContain('48');
    expect(el.textContent).toContain('3');
    // sem emoji
    expect(el.textContent).not.toContain('👍');
    expect(el.querySelectorAll('svg').length).toBe(2);
  });

  it('com extra, renderiza o 3º chip', () => {
    fixture.componentInstance.positivas = 1;
    fixture.componentInstance.negativas = 0;
    fixture.componentInstance.extra = 12;
    fixture.detectChanges();
    expect(el.querySelectorAll('.stat-chips__chip').length).toBe(3);
    expect(el.textContent).toContain('12');
  });

  it('extra = 0 ainda renderiza (0 é válido); null/undefined não', () => {
    fixture.componentInstance.extra = 0;
    fixture.detectChanges();
    expect(el.querySelectorAll('.stat-chips__chip').length).toBe(3);

    fixture.componentInstance.extra = null;
    fixture.detectChanges();
    expect(el.querySelectorAll('.stat-chips__chip').length).toBe(2);
  });
});
