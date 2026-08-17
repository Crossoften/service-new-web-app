import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ChatService } from '../../../core/services/chat';
import { SessionService } from '../../../core/services/session';
import { ChatMessageDto } from '../../../core/models/chat';
import { ApiError } from '../../../core/models/common';

const POLL_MS = 10000;

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly chat = inject(ChatService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);

  chatId = 0;
  outroNome = 'Conversa';
  mensagens: ChatMessageDto[] = [];
  novaMensagem = '';
  carregando = false;
  enviando = false;
  erro = '';
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.chatId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregando = true;
    this.carregar(false);
    this.chat.marcarLido(this.chatId).subscribe({ next: () => {}, error: () => {} });
    this.timer = setInterval(() => this.carregar(true), POLL_MS);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private carregar(silencioso: boolean) {
    this.chat
      .mensagens(this.chatId, { take: 50 })
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (res) => {
          if (res.chat?.otherUser?.name) this.outroNome = res.chat.otherUser.name;
          this.mensagens = [...(res.messages ?? [])].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        },
        error: (err: ApiError) => {
          if (!silencioso) {
            this.erro = err?.message?.trim() ? err.message : 'Não foi possível carregar a conversa.';
          }
        },
      });
  }

  enviar() {
    const texto = this.novaMensagem.trim();
    if (!texto || this.enviando) return;
    this.enviando = true;
    this.erro = '';
    this.chat
      .enviar(this.chatId, { message: texto })
      .pipe(finalize(() => (this.enviando = false)))
      .subscribe({
        next: () => {
          this.novaMensagem = '';
          this.carregar(true);
        },
        error: (err: ApiError) => {
          this.erro = err?.message?.trim() ? err.message : 'Não foi possível enviar a mensagem.';
        },
      });
  }

  souRemetente(m: ChatMessageDto): boolean {
    return this.session.userId() === m.sender?.id;
  }

  voltar() {
    history.back();
  }
}
