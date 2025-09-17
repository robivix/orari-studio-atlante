import { Injectable, signal } from '@angular/core';

// Simple client-side gate suitable for GitHub Pages (no backend)
// Default password can be changed at runtime by calling setPassword('new').
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'editorToken';
  private readonly pwdKey = 'editorPassword';

  unlocked = signal(this.isUnlocked());

  private getPassword(): string {
    return localStorage.getItem(this.pwdKey) || 'atlante';
  }

  setPassword(pwd: string) {
    try { localStorage.setItem(this.pwdKey, pwd); } catch {}
  }

  lock() {
    try { localStorage.removeItem(this.tokenKey); } catch {}
    this.unlocked.set(false);
  }

  unlockWith(pwd: string): boolean {
    if (pwd === this.getPassword()) {
      try { localStorage.setItem(this.tokenKey, '1'); } catch {}
      this.unlocked.set(true);
      return true;
    }
    return false;
  }

  isUnlocked(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
