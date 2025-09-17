import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [],
  template: `
    <div class="page-container fade-in-up">
      <div class="page-header">
        <h1>Orari Disponibili</h1>
        <p class="page-description">
          <strong>{{ name }}</strong> - {{ formatDay(day) }}
        </p>
      </div>

      <div class="content-card">
        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            Caricamento orari...
          </div>
        } @else {
          <div class="times-grid">
            @for (time of availableTimes(); track time; let i = $index) {
              <button
                class="time-card btn-secondary btn-block"
                (click)="go(time)"
                [style.animation-delay.ms]="i * 100">
                <div class="time-content">
                  <div class="time-icon">🕐</div>
                  <span class="time-text">{{ time }}</span>
                </div>
              </button>
            }
          </div>

          <div class="back-section">
            <button class="btn-ghost" (click)="router.navigate(['/instructor', name])">
              ← Torna ai Giorni
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
      color: var(--secondary-600);
      font-weight: 600;
    }

    .content-card {
      background: white;
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-100);
    }

    .times-grid {
      display: grid;
      gap: var(--space-3);
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      margin-bottom: var(--space-8);
    }

    .time-card {
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      animation: slideInLeft var(--transition-slow) ease-out both;
      min-height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-content {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .time-icon {
      font-size: var(--font-size-xl);
    }

    .time-text {
      font-size: var(--font-size-lg);
      font-weight: 600;
      font-family: 'Monaco', 'Menlo', monospace;
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

      .times-grid {
        grid-template-columns: 1fr;
        gap: var(--space-2);
      }

      .time-card {
        padding: var(--space-3);
        min-height: 60px;
      }

      .time-text {
        font-size: var(--font-size-base);
      }
    }
  `]
})
export class TimesComponent implements OnInit {
  ds = inject(DataService);
  router = inject(Router);
  ar = inject(ActivatedRoute);

  name = this.ar.snapshot.paramMap.get('name')!;
  day = this.ar.snapshot.paramMap.get('day')!;
  loading = signal(true);
  availableTimes = signal<string[]>([]);

  async ngOnInit() {
    try {
      const times = await this.ds.getTimesForInstructorAndDay(this.name, this.day);
      this.availableTimes.set(times);
    } catch (error) {
      console.error('Error loading times:', error);
    } finally {
      this.loading.set(false);
    }
  }

  go(time: string) {
    this.router.navigate(['/instructor', this.name, 'day', this.day, 'time', time]);
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
