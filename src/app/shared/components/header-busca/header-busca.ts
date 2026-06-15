import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-busca',
  imports: [CommonModule],
  templateUrl: './header-busca.html',
  styleUrl: './header-busca.scss'
})
export class HeaderBuscaComponent {
  @Input() titulo: string = 'BUSCAR';
  @Input() variante: 'padrao' | 'delivery' = 'padrao';
  @Input() endereco: string = 'Rua Tuiucue 122';
  @Output() buscarChange = new EventEmitter<string>();

  constructor(private router: Router) {}

  voltar() {
    this.router.navigate(['/home']);
  }

  onBuscar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.buscarChange.emit(valor);
  }
}