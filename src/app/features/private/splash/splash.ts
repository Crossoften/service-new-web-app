import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  imports: [],
  templateUrl: './splash.html',
  styleUrl: './splash.scss'
})
export class SplashComponent implements OnInit {
  progress = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    const interval = setInterval(() => {
      this.progress += 2;
      if (this.progress >= 100) {
        clearInterval(interval);
        this.router.navigate(['/home']);
      }
    }, 40); // 40ms * 50 = ~2 segundos
  }
}