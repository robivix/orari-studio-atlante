import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [],
  template: `
    <div class="page-container fade-in-up">
      <div class="page-header">
        <h1>Seleziona Istruttore</h1>
        <p class="page-description">Scegli l'istruttore per visualizzare i suoi orari disponibili</p>
      </div>

      <div class="content-card">
        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            Caricamento dati...
          </div>
        } @else {
          <div class="instructor-grid">
            @for (instructor of instructors(); track instructor; let i = $index) {
              <button
                class="instructor-card"
                (click)="go(instructor)"
                [style.animation-delay.ms]="i * 100">
                <div class="instructor-avatar">
                  {{ getInitials(instructor) }}
                </div>
                <div class="instructor-info">
                  <h3>{{ instructor }}</h3>
                  <span class="instructor-role">Istruttore</span>
                </div>
                <div class="arrow-icon">→</div>
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
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
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .content-card {
      background: white;
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-100);
    }

    .instructor-grid {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .instructor-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5);
      background: var(--gray-50);
      border: 2px solid transparent;
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: all var(--transition-normal);
      text-align: left;
      width: 100%;
      animation: slideInLeft var(--transition-slow) ease-out both;
    }

    .instructor-card:hover {
      background: white;
      border-color: var(--primary-200);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .instructor-avatar {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background: var(--gradient-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-lg);
      flex-shrink: 0;
    }

    .instructor-info {
      flex: 1;
    }

    .instructor-info h3 {
      margin: 0;
      color: var(--gray-800);
      font-size: var(--font-size-lg);
      font-weight: 600;
      background: none;
      -webkit-text-fill-color: var(--gray-800);
    }

    .instructor-role {
      color: var(--gray-500);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
      display: block;
    }

    .arrow-icon {
      color: var(--primary-500);
      font-size: var(--font-size-xl);
      font-weight: 600;
      transition: transform var(--transition-fast);
    }

    .instructor-card:hover .arrow-icon {
      transform: translateX(4px);
    }

    @media (max-width: 768px) {
      .page-container {
        padding: var(--space-4);
      }

      .content-card {
        padding: var(--space-6);
      }

      .instructor-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InstructorsComponent implements OnInit {
  ds = inject(DataService);
  router = inject(Router);

  loading = signal(true);
  instructors = signal<string[]>([]);

  async ngOnInit() {
    try {
      await this.ds.ensureDataLoaded();
      this.instructors.set(this.ds.instructors);
    } catch (error) {
      console.error('Error loading instructors:', error);
    } finally {
      this.loading.set(false);
    }
  }

  go(name: string) {
    this.router.navigate(['/instructor', name]);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
