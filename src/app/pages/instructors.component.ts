import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <h1>ISTRUTTORI</h1>
      <button class="btn" *ngFor="let i of ds.instructors" (click)="go(i)">{{ i }}</button>
    </div>
  `,
  styles: [`
    .panel{ max-width: 480px; margin: 20px auto; text-align: center; }
    h1{ color:#0d5072; letter-spacing:1px; }
    .btn{ display:block; width:100%; padding:14px; margin:12px 0; background:#0e567d; color:#fff; border:none; border-radius:8px; font-size:20px; }
    .btn:hover{ background:#0b4868; cursor:pointer; }
  `]
})
export class InstructorsComponent {
  ds = inject(DataService);
  router = inject(Router);
  go(name: string) {
    this.router.navigate(['/instructor', name]);
  }
}
