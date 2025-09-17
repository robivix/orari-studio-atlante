import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-days',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <h1>GIORNI</h1>
      <button class="btn" *ngFor="let d of ds.days" (click)="go(d)">{{ d }}</button>
      <div class="back"><button class="link" (click)="router.navigate(['/'])">← ISTRUTTORI</button></div>
    </div>
  `,
  styles: [`
    .panel{ max-width: 480px; margin: 20px auto; text-align: center; }
    h1{ color:#0d5072; letter-spacing:1px; }
    .btn{ display:block; width:100%; padding:14px; margin:12px 0; background:#0e567d; color:#fff; border:none; border-radius:8px; font-size:20px; }
    .btn:hover{ background:#0b4868; cursor:pointer; }
    .back{ margin-top:8px; }
    .link{ background:none; border:none; color:#0e567d; font-size:16px; cursor:pointer; }
  `]
})
export class DaysComponent {
  ds = inject(DataService);
  router = inject(Router);
  ar = inject(ActivatedRoute);
  name = this.ar.snapshot.paramMap.get('name')!;
  go(day: string) {
    this.router.navigate(['/instructor', this.name, 'day', day]);
  }
}
