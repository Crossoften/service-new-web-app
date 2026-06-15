import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface ItemListagem {
  id: number;
  nome: string;
  descricao: string;
  avaliacao: number;
  totalAvaliacoes: number;
  preco: string;
  distancia: string;
  imagem: string;
}

@Component({
  selector: 'app-listagem-generica',
  imports: [CommonModule],
  templateUrl: './listagem-generica.html',
  styleUrl: './listagem-generica.scss'
})
export class ListagemGenericaComponent implements OnInit {
  tipo: string = '';
  categoria: string = '';

  items: ItemListagem[] = [
    {
      id: 1,
      nome: 'Empresa / Profissional 1',
      descricao: 'Descrição breve do serviço oferecido pelo profissional.',
      avaliacao: 4.8,
      totalAvaliacoes: 120,
      preco: 'A partir de R$ 50,00',
      distancia: '1,2 km',
      imagem: ''
    },
    {
      id: 2,
      nome: 'Empresa / Profissional 2',
      descricao: 'Descrição breve do serviço oferecido pelo profissional.',
      avaliacao: 4.5,
      totalAvaliacoes: 98,
      preco: 'A partir de R$ 80,00',
      distancia: '2,5 km',
      imagem: ''
    },
    {
      id: 3,
      nome: 'Empresa / Profissional 3',
      descricao: 'Descrição breve do serviço oferecido pelo profissional.',
      avaliacao: 4.2,
      totalAvaliacoes: 54,
      preco: 'A partir de R$ 35,00',
      distancia: '3,8 km',
      imagem: ''
    },
    {
      id: 4,
      nome: 'Empresa / Profissional 4',
      descricao: 'Descrição breve do serviço oferecido pelo profissional.',
      avaliacao: 5.0,
      totalAvaliacoes: 200,
      preco: 'A partir de R$ 120,00',
      distancia: '0,8 km',
      imagem: ''
    },
    {
      id: 5,
      nome: 'Empresa / Profissional 5',
      descricao: 'Descrição breve do serviço oferecido pelo profissional.',
      avaliacao: 3.9,
      totalAvaliacoes: 31,
      preco: 'A partir de R$ 60,00',
      distancia: '5,1 km',
      imagem: ''
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') ?? '';
    this.categoria = this.route.snapshot.queryParamMap.get('categoria') ?? '';
  }

voltar() {
  history.back();
}

  get titulo(): string {
    return this.categoria || this.tipo || 'Resultados';
  }

  estrelas(avaliacao: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(avaliacao) ? 1 : 0);
  }

  irParaLogin() {
  this.router.navigate(['/login']);
}
}