import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <h1>TURNI</h1>
      <button class="btn time" *ngFor="let t of ds.times" (click)="go(t)">{{ t }}</button>
      <div class="back"><button class="link" (click)="router.navigate(['/instructor', name])">← GIORNI</button></div>
    </div>
  `,
  styles: [`
    .panel{ max-width: 480px; margin: 20px auto; text-align: center; }
    h1{ color:#0d5072; letter-spacing:1px; }
    .btn{ display:block; width:100%; padding:14px; margin:12px 0; background:#0e567d; color:#fff; border:none; border-radius:8px; font-size:20px; }
    .btn.time{ background:#2f6b2f; }
    .btn:hover{ filter:brightness(0.95); cursor:pointer; }
    .back{ margin-top:8px; }
    .link{ background:none; border:none; color:#0e567d; font-size:16px; cursor:pointer; }
  `]
})
export class TimesComponent {
  ds = inject(DataService);
  router = inject(Router);
  ar = inject(ActivatedRoute);
  name = this.ar.snapshot.paramMap.get('name')!;
  day = this.ar.snapshot.paramMap.get('day')!;
  go(time: string) {
    this.router.navigate(['/instructor', this.name, 'day', this.day, 'time', time]);
  }
}
