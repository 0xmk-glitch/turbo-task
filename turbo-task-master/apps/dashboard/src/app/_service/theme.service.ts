import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'turbo-task-theme';
  private readonly DARK_CLASS = 'dark';
  
  // Signal for reactive theme state
  public isDarkMode = signal(this.getStoredTheme() === 'dark');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const storedTheme = this.getStoredTheme();
    this.setTheme(storedTheme);
  }

  private getStoredTheme(): 'dark' | 'light' {
    const stored = localStorage.getItem(this.THEME_KEY);
    return (stored as 'dark' | 'light') || 'light';
  }

  private setStoredTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const current = this.isDarkMode();
    const next = current ? 'light' : 'dark';
    this.setTheme(next);
  }

  setTheme(theme: 'dark' | 'light'): void {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add(this.DARK_CLASS);
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove(this.DARK_CLASS);
      html.setAttribute('data-theme', 'light');
    }
    
    this.setStoredTheme(theme);
    this.isDarkMode.set(theme === 'dark');
  }

  getCurrentTheme(): 'dark' | 'light' {
    return this.isDarkMode() ? 'dark' : 'light';
  }

  isDarkModeActive(): boolean {
    return this.isDarkMode();
  }
}
