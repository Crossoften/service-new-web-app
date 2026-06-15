import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BottomNavParceiroComponent } from '../../../shared/components/bottom-nav-parceiro/bottom-nav-parceiro';

@Component({
  selector: 'app-home-parceiro',
  imports: [CommonModule, BottomNavParceiroComponent],
  templateUrl: './home-parceiro.html',
  styleUrl: './home-parceiro.scss'
})
export class HomeParceiroComponent {
  link = 'https://service.app/indique/seunome';
  linkCopiado = false;

  stats = {
    downloads: 100,
    pagantes: 50,
    comissao: 500.00,
    ranking: 24
  };

  ultimasIndicacoes = [
    { id: 1, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '' },
    { id: 2, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '' },
    { id: 3, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '' },
    { id: 4, nome: 'Joelson Silva', profissao: 'Pedreiro', descricao: 'Lorem ipsum dolor sit amet,', foto: '' },
  ];

  constructor(public router: Router) {}

  copiarLink() {
    navigator.clipboard.writeText(this.link);
    this.linkCopiado = true;
    setTimeout(() => this.linkCopiado = false, 2000);
  }

  compartilhar() {
    if (navigator.share) {
      navigator.share({ title: 'Service App', url: this.link });
    }
  }
}