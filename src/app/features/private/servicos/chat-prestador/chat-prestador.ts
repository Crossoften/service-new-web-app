import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Mensagem {
  id: number;
  texto?: string;
  arquivo?: { nome: string; tipo: string; data: string };
  enviada: boolean;
  horario: string;
  data: string;
}

@Component({
  selector: 'app-chat-prestador',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-prestador.html',
  styleUrl: './chat-prestador.scss'
})
export class ChatPrestadorComponent implements OnInit, AfterViewChecked {
  @ViewChild('mensagensContainer') mensagensContainer!: ElementRef;

  prestadorId: number = 0;
  prestadorNome: string = 'Joelson Silva';
  novaMensagem: string = '';

  mensagens: Mensagem[] = [
    {
      id: 1,
      texto: 'Lorem Ipsum Dolor Sit Amet, Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut',
      enviada: true,
      horario: '',
      data: 'yesterday'
    },
    {
      id: 2,
      texto: 'Lorem Ipsum Dolor Sit Amet, Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut',
      enviada: false,
      horario: '00:00',
      data: 'yesterday'
    },
    {
      id: 3,
      texto: 'Lorem Ipsum Dolor Sit Amet, Consectetur Adipisicing Elit, Sed Do Eiusmod Tempor Incididunt Ut',
      enviada: true,
      horario: '09:00',
      data: 'Today'
    },
    {
      id: 4,
      arquivo: { nome: 'Arquivo', tipo: 'PDF', data: '00/00/00' },
      enviada: false,
      horario: '',
      data: 'Today'
    },
  ];

  get grupos(): { data: string; mensagens: Mensagem[] }[] {
    const map = new Map<string, Mensagem[]>();
    this.mensagens.forEach(m => {
      if (!map.has(m.data)) map.set(m.data, []);
      map.get(m.data)!.push(m);
    });
    return Array.from(map.entries()).map(([data, mensagens]) => ({ data, mensagens }));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.prestadorId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewChecked() {
    this.scrollParaBaixo();
  }

  scrollParaBaixo() {
    if (this.mensagensContainer) {
      const el = this.mensagensContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  enviar() {
    if (!this.novaMensagem.trim()) return;
    this.mensagens.push({
      id: this.mensagens.length + 1,
      texto: this.novaMensagem,
      enviada: true,
      horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      data: 'Today'
    });
    this.novaMensagem = '';
  }

  anexarArquivo() {
    // Futuramente: abrir file picker
  }

  voltar() {
    history.back();
  }
}