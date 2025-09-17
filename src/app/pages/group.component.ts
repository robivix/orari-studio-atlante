import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService, Group, Participant } from '../services/data.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <div class="panel">
      <h1>{{ group()?.title || 'Loading...' }}</h1>

      <div class="toolbar">
        <button class="link" (click)="back()">← TURNI</button>
        <span class="spacer"></span>
      </div>

      <div *ngIf="!group()">Loading data...</div>

      <table class="grid" *ngIf="group()">
        <thead>
          <tr><th>NOME</th><th>COGNOME</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of group()!.participants; let i = index">
            <td>
              <span>{{ p.nome }}</span>
            </td>
            <td>
              <span>{{ p.cognome }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .panel{ max-width: 900px; margin: 20px auto; }
    h1{ color:#0d5072; text-align:center; }
    .toolbar{ display:flex; align-items:center; margin:12px 0; }
    .spacer{ flex:1; }
    .btn{ background:#0e567d; color:#fff; border:none; padding:8px 14px; border-radius:8px; cursor:pointer; }
    .btn.warn{ background:#a43d3d; }
    .link{ background:none; border:none; color:#0e567d; cursor:pointer; font-size:14px; }
    .link.danger{ color:#a43d3d; }
    table.grid{ width:100%; border-collapse: collapse; }
    table.grid th, table.grid td{ border-bottom:1px solid #ddd; padding:8px; }
    .center{ text-align:center; }
    input{ width:100%; padding:6px 8px; border:1px solid #ccc; border-radius:6px; }
    .chip{ padding:6px 10px; border-radius:16px; border:1px solid #888; background:#f3f6f8; }
    .chip.on{ background:#2f6b2f; color:#fff; border-color:#2f6b2f; }
    .actions{ display:flex; gap:10px; justify-content:flex-end; margin-top:12px; }
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
    // Load the group data asynchronously
    this.loadGroup();
  }

  private async loadGroup() {
    try {
      const group = await this.ds.getGroup(this.name, this.day, this.time);
      this.current.set(group);
    } catch (error) {
      console.error('Error loading group:', error);
      // Handle error appropriately
    }
  }

  onEdit(i: number, field: keyof Participant, value: any) {
    const g = structuredClone(this.current());
    if (!g) return;
    (g.participants[i] as any)[field] = !g.participants[i][field];
    g.participants.push({ nome:'', cognome:'' });
  }

  add() {
    const g = structuredClone(this.current());
    if (!g) return;
    g.participants.push({ nome:'', cognome:'' });
    this.current.set(g);
  }

  remove(i: number) {
    const g = structuredClone(this.current());
    if (!g) return;
    g.participants.splice(i,1);
    this.current.set(g);
  }

  save() {
    const currentGroup = this.current();
    if (!currentGroup) return;
    this.ds.saveGroup(this.name, this.day, this.time, currentGroup);
    alert('Salvato');
  }

  back() {
    this.router.navigate(['/times', this.name, this.day]);
  }

  askUnlock() {
    const pwd = prompt('Inserisci password per modificare:');
    if (!pwd) return;
    if (!this.auth.unlockWith(pwd)) alert('Password errata');
  }
}
