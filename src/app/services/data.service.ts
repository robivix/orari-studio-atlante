import { Injectable } from '@angular/core';

export type Participant = { nome: string; cognome: string };
export type Group = { title: string; participants: Participant[] };
export type ScheduleEntry = {
  istruttore: string;
  nome: string;
  cognome: string;
  giorno: string;
  orario: string;
};

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
  private allData: ScheduleEntry[] = [];
  private dataLoaded = false;

  // Dynamic arrays that will be populated from CSV data
  instructors: string[] = [];
  days: string[] = [];
  times: string[] = [];

  private key(name: string, day: string, time: string) {
    return `group:${name}:${day}:${time}`;
  }

  async ensureDataLoaded(): Promise<void> {
    if (this.dataLoaded) return;

    try {
      // Load the single consolidated CSV file
      this.allData = await this.loadScheduleCSV();

      // Extract unique instructors, days, and times from the data
      this.extractUniqueValues();

      this.dataLoaded = true;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      // Use fallback data if loading fails
      this.useFallbackData();
    }
  }

  private async loadScheduleCSV(): Promise<ScheduleEntry[]> {
    try {
      const response = await fetch('./data/schedule.csv');
      if (!response.ok) {
        throw new Error('Failed to load schedule.csv');
      }

      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('Error loading schedule.csv:', error);
      throw error;
    }
  }

  private parseCSV(csvText: string): ScheduleEntry[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return []; // No data rows

    // Skip header row and parse data with new column order: istruttore,giorno,orario,nome,cognome
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        istruttore: values[0]?.trim() || '',
        giorno: values[1]?.trim() || '',
        orario: values[2]?.trim() || '',
        nome: values[3]?.trim() || '',
        cognome: values[4]?.trim() || ''
      };
    }).filter(entry => entry.istruttore && entry.giorno && entry.orario); // Filter out invalid entries
  }

  private extractUniqueValues(): void {
    // Extract unique instructors
    this.instructors = [...new Set(this.allData.map(entry => entry.istruttore))].sort();

    // Extract unique days (preserve Italian weekday order)
    const dayOrder = ['LUNEDÌ', 'MARTEDÌ', 'MERCOLEDÌ', 'GIOVEDÌ', 'VENERDÌ', 'SABATO', 'DOMENICA'];
    const uniqueDays = new Set(this.allData.map(entry => entry.giorno));
    this.days = dayOrder.filter(day => uniqueDays.has(day));

    // Extract unique times and sort them
    const uniqueTimes = new Set(this.allData.map(entry => entry.orario));
    this.times = Array.from(uniqueTimes).sort((a, b) => {
      // Convert times to comparable format for sorting
      const timeA = a.split(':').map(n => parseInt(n));
      const timeB = b.split(':').map(n => parseInt(n));
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  }

  private useFallbackData(): void {
    // Fallback to original hardcoded data if CSV loading fails
    this.instructors = ['SILVIA', 'MATILDE', 'ALICE'];
    this.days = ['LUNEDÌ', 'MARTEDÌ', 'MERCOLEDÌ', 'GIOVEDÌ', 'VENERDÌ'];
    this.times = ['8:00', '9:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    // Create some fallback data
    this.allData = [
      { istruttore: 'SILVIA', nome: 'ROBERTO', cognome: 'VISSANI', giorno: 'LUNEDÌ', orario: '9:00' },
      { istruttore: 'SILVIA', nome: 'LAURA', cognome: 'XXXX', giorno: 'LUNEDÌ', orario: '9:00' }
    ];

    this.dataLoaded = true;
  }

  async getGroup(name: string, day: string, time: string): Promise<Group> {
    await this.ensureDataLoaded();

    const title = `GRUPPO ${name} ${day} ${time}`;
    const key = this.key(name, day, time);

    // Try to get from localStorage first
    const stored = lsGet<Group | null>(key, null);
    if (stored) {
      return stored;
    }

    // Filter data by instructor, day, and time
    const filteredParticipants = this.allData
      .filter(entry =>
        entry.istruttore === name &&
        entry.giorno === day &&
        entry.orario === time
      )
      .map(entry => ({
        nome: entry.nome,
        cognome: entry.cognome
      }));

    return { title, participants: filteredParticipants };
  }

  saveGroup(name: string, day: string, time: string, group: Group) {
    lsSet(this.key(name, day, time), group);
  }

  // Method to get available days for a specific instructor
  async getDaysForInstructor(instructor: string): Promise<string[]> {
    await this.ensureDataLoaded();

    const instructorDays = new Set(
      this.allData
        .filter(entry => entry.istruttore === instructor)
        .map(entry => entry.giorno)
    );

    // Return days in the correct order
    return this.days.filter(day => instructorDays.has(day));
  }

  // Method to get available times for a specific instructor and day
  async getTimesForInstructorAndDay(instructor: string, day: string): Promise<string[]> {
    await this.ensureDataLoaded();

    const availableTimes = new Set(
      this.allData
        .filter(entry =>
          entry.istruttore === instructor &&
          entry.giorno === day
        )
        .map(entry => entry.orario)
    );

    // Return times in the correct order
    return this.times.filter(time => availableTimes.has(time));
  }
}
