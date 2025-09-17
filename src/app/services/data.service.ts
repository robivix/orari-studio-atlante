import { Injectable } from '@angular/core';

export type Participant = { nome: string; cognome: string; presenza: boolean; recupero: boolean };
export type Group = { title: string; participants: Participant[] };

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly instructors = ['SILVIA','MATILDE','ALICE'];
  readonly days = ['LUNEDÌ','MARTEDÌ','MERCOLEDÌ','GIOVEDÌ','VENERDÌ'];
  readonly times = ['8:00','9:00','10:00','11:00','12:00','16:00','17:00','18:00','19:00','20:00'];

  private participantsCache = new Map<string, any[]>();

  private key(name: string, day: string, time: string) {
    return `group:${name}:${day}:${time}`;
  }

  private async loadParticipantsFromCSV(instructor: string): Promise<any[]> {
    // Check cache first
    if (this.participantsCache.has(instructor)) {
      return this.participantsCache.get(instructor)!;
    }

    try {
      const response = await fetch(`/data/${instructor}.csv`);
      if (!response.ok) {
        throw new Error(`Failed to load CSV for ${instructor}`);
      }

      const csvText = await response.text();
      const participants = this.parseCSV(csvText);

      // Cache the results
      this.participantsCache.set(instructor, participants);
      return participants;
    } catch (error) {
      console.error(`Error loading CSV for ${instructor}:`, error);
      // Return fallback data if CSV loading fails
      return this.getFallbackParticipants();
    }
  }

  private parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n');

    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        nome: values[0] || '',
        cognome: values[1] || '',
        giorno: values[2] || '',
        orario: values[3] || '',
        presenza: values[4] === 'true',
        recupero: values[5] === 'true'
      };
    });
  }

  private getFallbackParticipants(): any[] {
    return [
      { nome: 'ROBERTO', cognome: 'VISSANI', giorno: 'LUNEDÌ', orario: '9:00', presenza: true, recupero: false },
      { nome: 'LAURA', cognome: 'XXXX', giorno: 'LUNEDÌ', orario: '9:00', presenza: true, recupero: true },
      { nome: 'MARIA', cognome: 'XXX', giorno: 'LUNEDÌ', orario: '9:00', presenza: false, recupero: true },
      { nome: 'ANTONIO', cognome: '', giorno: 'MARTEDÌ', orario: '10:00', presenza: true, recupero: false },
      { nome: 'GIOVANNA', cognome: '', giorno: 'MARTEDÌ', orario: '10:00', presenza: true, recupero: false },
      { nome: 'MARTA', cognome: 'XXX', giorno: 'MERCOLEDÌ', orario: '16:00', presenza: true, recupero: false },
      { nome: 'MERY', cognome: 'XXX', giorno: 'MERCOLEDÌ', orario: '16:00', presenza: true, recupero: false }
    ];
  }

  async getGroup(name: string, day: string, time: string): Promise<Group> {
    const title = `GRUPPO ${name} ${day} ${time}`;
    const key = this.key(name, day, time);

    // Try to get from localStorage first
    const stored = lsGet<Group | null>(key, null);
    if (stored) {
      return stored;
    }

    // If not in localStorage, load from CSV and filter by day and time
    const allParticipants = await this.loadParticipantsFromCSV(name);
    const filteredParticipants = allParticipants
      .filter(p => p.giorno === day && p.orario === time)
      .map(p => ({
        nome: p.nome,
        cognome: p.cognome,
        presenza: p.presenza,
        recupero: p.recupero
      }));

    return { title, participants: filteredParticipants };
  }

  saveGroup(name: string, day: string, time: string, group: Group) {
    lsSet(this.key(name, day, time), group);
  }
}
