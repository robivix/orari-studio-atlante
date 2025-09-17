import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-days',
  standalone: true,
  imports: [],
  template: `
    <div class="page-container fade-in-up">
      <div class="page-header">
        <h1>Giorni Disponibili</h1>
        <p class="page-description">Orari per <strong>{{ name }}</strong></p>
      </div>

      <div class="content-card">
        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            Caricamento dati...
          </div>
        } @else {
          <div class="days-grid">
            @for (day of availableDays(); track day; let i = $index) {
              <button
                class="day-card btn-primary btn-block"
                (click)="go(day)"
                [style.animation-delay.ms]="i * 100">
                <div class="day-content">
                  <div class="day-icon">📅</div>
                  <span class="day-name">{{ formatDay(day) }}</span>
                </div>
              </button>
            }
          </div>

          <div class="back-section">
            <button class="btn-ghost" (click)="router.navigate(['/'])">
              ← Torna agli Istruttori
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-6);
    }

    .page-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .page-description {
      color: var(--gray-600);
      font-size: var(--font-size-lg);
      margin-top: var(--space-2);
    }

    .page-description strong {
      color: var(--primary-600);
      font-weight: 600;
    }

    .content-card {
      background: white;
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-100);
    }

    .days-grid {
      display: grid;
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .day-card {
      padding: var(--space-5);
      border-radius: var(--radius-xl);
      animation: slideInLeft var(--transition-slow) ease-out both;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .day-content {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .day-icon {
      font-size: var(--font-size-2xl);
    }

    .day-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      text-transform: capitalize;
    }

    .back-section {
      text-align: center;
      padding-top: var(--space-6);
      border-top: 1px solid var(--gray-200);
    }

    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-4);
      }

      .content-card {
        padding: var(--space-6);
      }

      .day-card {
        padding: var(--space-4);
        min-height: 70px;
      }

      .day-name {
        font-size: var(--font-size-base);
      }
    }
  `]
})
export class DaysComponent implements OnInit {
  ds = inject(DataService);
  router = inject(Router);
  ar = inject(ActivatedRoute);

  name = this.ar.snapshot.paramMap.get('name')!;
  loading = signal(true);
  availableDays = signal<string[]>([]);

  async ngOnInit() {
    try {
      const days = await this.ds.getDaysForInstructor(this.name);
      this.availableDays.set(days);
    } catch (error) {
      console.error('Error loading days:', error);
    } finally {
      this.loading.set(false);
    }
  }

  go(day: string) {
    this.router.navigate(['/instructor', this.name, 'day', day]);
  }

  formatDay(day: string): string {
    const dayNames: { [key: string]: string } = {
      'monday': 'Lunedì',
      'tuesday': 'Martedì',
      'wednesday': 'Mercoledì',
      'thursday': 'Giovedì',
      'friday': 'Venerdì',
      'saturday': 'Sabato',
      'sunday': 'Domenica'
    };
    return dayNames[day.toLowerCase()] || day;
  }
}
