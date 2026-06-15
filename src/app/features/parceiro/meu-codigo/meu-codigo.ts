import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavParceiroComponent } from '../../../shared/components/bottom-nav-parceiro/bottom-nav-parceiro';

@Component({
  selector: 'app-meu-codigo',
  imports: [CommonModule, BottomNavParceiroComponent],
  templateUrl: './meu-codigo.html',
  styleUrl: './meu-codigo.scss'
})
export class MeuCodigoComponent {
  link = 'https://service.app/indique/seunome';
  linkCopiado = false;

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