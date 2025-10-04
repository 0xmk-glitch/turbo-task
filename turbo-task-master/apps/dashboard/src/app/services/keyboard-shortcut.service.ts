import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private keydownSubject = new Subject<KeyboardEvent>();

  constructor() {
    this.setupGlobalListener();
  }

  private setupGlobalListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.keydownSubject.next(event);
      this.handleKeydown(event);
    });
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    const key = this.generateKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  unregisterShortcut(key: string, ctrlKey = false, shiftKey = false, altKey = false, metaKey = false): void {
    const shortcutKey = this.generateKey({ key, ctrlKey, shiftKey, altKey, metaKey });
    this.shortcuts.delete(shortcutKey);
  }

  private handleKeydown(event: KeyboardEvent): void {
    const key = this.generateKey({
      key: event.key.toLowerCase(),
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });

    const shortcut = this.shortcuts.get(key);
    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.action();
    }
  }

  private generateKey(shortcut: Partial<KeyboardShortcut>): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.metaKey) parts.push('meta');
    parts.push(shortcut.key?.toLowerCase() || '');
    return parts.join('+');
  }

  isInputField(target: any): boolean {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.contentEditable === 'true' ||
      target.getAttribute('role') === 'textbox' ||
      target.classList.contains('mat-mdc-form-field') ||
      target.closest('.mat-mdc-form-field')
    );
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}
