import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPrestador } from './chat-prestador';

describe('ChatPrestador', () => {
  let component: ChatPrestador;
  let fixture: ComponentFixture<ChatPrestador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatPrestador],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatPrestador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
