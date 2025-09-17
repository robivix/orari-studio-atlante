import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService, Group, Participant } from '../services/data.service';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [],
  template: `
    <div class="page-container fade-in-up">
      <div class="page-header">
        <h1>Gruppo di Allenamento</h1>
        <p class="page-description">
          <strong>{{ name }}</strong> - {{ formatDay(day) }} alle {{ time }}
        </p>
      </div>

      <div class="content-card">
        @if (!group()) {
          <div class="loading">
            <div class="spinner"></div>
            Caricamento gruppo...
          </div>
        } @else {
          <div class="group-info">
            <h2 class="group-title">{{ group()!.title }}</h2>

            <div class="participants-section">
              <div class="section-header">
                <h3>Partecipanti ({{ group()!.participants.length }})</h3>
              </div>

              @if (group()!.participants.length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">👥</div>
                  <p>Nessun partecipante registrato</p>
                </div>
              } @else {
                <div class="participants-grid">
                  @for (participant of group()!.participants; track $index; let i = $index) {
                    <div class="participant-card" [style.animation-delay.ms]="i * 50">
                      <div class="participant-avatar">
                        {{ getParticipantInitials(participant) }}
                      </div>
                      <div class="participant-info">
                        <div class="participant-name">
                          {{ participant.nome }} {{ participant.cognome }}
                        </div>
                        <div class="participant-role">Partecipante</div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="back-section">
            <button class="btn-ghost" (click)="back()">
              ← Torna agli Orari
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
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
      color: var(--accent-600);
      font-weight: 600;
    }

    .content-card {
      background: white;
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--gray-100);
    }

    .group-info {
      margin-bottom: var(--space-8);
    }

    .group-title {
      color: var(--gray-800);
      font-size: var(--font-size-2xl);
      font-weight: 700;
      text-align: center;
      margin-bottom: var(--space-6);
      background: var(--gradient-accent);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .participants-section {
      margin-top: var(--space-6);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-3);
      border-bottom: 2px solid var(--gray-100);
    }

    .section-header h3 {
      color: var(--gray-700);
      font-size: var(--font-size-xl);
      font-weight: 600;
      margin: 0;
      background: none;
      -webkit-text-fill-color: var(--gray-700);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-12);
      color: var(--gray-500);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-4);
    }

    .participants-grid {
      display: grid;
      gap: var(--space-3);
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    .participant-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
      animation: slideInLeft var(--transition-slow) ease-out both;
    }

    .participant-card:hover {
      background: white;
      border-color: var(--accent-200);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .participant-avatar {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--gradient-accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: var(--font-size-sm);
      flex-shrink: 0;
    }

    .participant-info {
      flex: 1;
    }

    .participant-name {
      font-weight: 600;
      color: var(--gray-800);
      font-size: var(--font-size-base);
    }

    .participant-role {
      color: var(--gray-500);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
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

      .participants-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }
    }
  `]
})
export class GroupComponent {
  ar = inject(ActivatedRoute);
  router = inject(Router);
  ds = inject(DataService);
  auth = inject(AuthService);

  name = this.ar.snapshot.paramMap.get('name')!;
  day = this.ar.snapshot.paramMap.get('day')!;
  time = this.ar.snapshot.paramMap.get('time')!;

  private current = signal<Group | null>(null);
  group = computed(() => this.current());

  constructor() {
    this.loadGroup();
  }

  private async loadGroup() {
    try {
      const group = await this.ds.getGroup(this.name, this.day, this.time);
      this.current.set(group);
    } catch (error) {
      console.error('Error loading group:', error);
    }
  }

  back() {
    this.router.navigate(['/instructor', this.name, 'day', this.day]);
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

  getParticipantInitials(participant: Participant): string {
    const firstName = participant.nome || '';
    const lastName = participant.cognome || '';
    return (firstName[0] || '') + (lastName[0] || '');
  }
}
