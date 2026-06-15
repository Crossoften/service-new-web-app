import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro-sucesso',
  imports: [],
  templateUrl: './cadastro-sucesso.html',
  styleUrl: './cadastro-sucesso.scss'
})
export class CadastroSucessoComponent {

  constructor(private router: Router) {}

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}