import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <style>
      header{ display:flex; align-items:center; justify-content:center; padding:14px; background:#f5f7f9; border-bottom:1px solid #e5e7eb; }
      header h2{ margin:0; color:#0d5072; letter-spacing:0.5px; }
      main{ padding:20px; }
      .home-logo{ display:block; margin:0 auto 20px auto; cursor: pointer; text-align: center; }
      .home-logo img{ display: block; margin: 0 auto; }
    </style>
    <header>
      <h2>Studio Atlante - Orari</h2>
    </header>
    <main>
      <div class="home-logo" (click)="navigateToHome()">
        <img src="logo.png" alt="Studio Atlante Logo">
      </div>
      <router-outlet></router-outlet>
    </main>
  `
})
export class App {
  protected readonly title = signal('orari-studio-atlante');

  constructor(private router: Router) {}

  navigateToHome() {
    this.router.navigate(['']);
  }
}
