import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-splash',
  imports: [],
  templateUrl: './splash.html',
  styleUrl: './splash.scss',
})
export class SplashComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly auth = inject(AuthService);

  progress = 0;
  private interval?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.interval = setInterval(() => {
      this.progress += 2;
      if (this.progress >= 100) {
        clearInterval(this.interval);
        this.redirecionar();
      }
    }, 40); // ~2 segundos
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  /** Sem sessão → login; com sessão → home do perfil. */
  private redirecionar() {
    if (this.session.isAuthenticated()) {
      this.router.navigateByUrl(this.auth.homeRouteFor(this.session.profileType()));
    } else {
      this.router.navigate(['/login']);
    }
  }
}
