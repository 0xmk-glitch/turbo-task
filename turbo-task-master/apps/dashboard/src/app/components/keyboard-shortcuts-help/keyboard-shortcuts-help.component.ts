import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export interface ShortcutInfo {
  key: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-keyboard-shortcuts-help',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="p-6 max-w-2xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-neutral-900 dark:text-white flex items-center">
          <mat-icon fontIcon="keyboard" class="mr-3 text-accent-600 dark:text-accent-400"></mat-icon>
          Keyboard Shortcuts
        </h2>
        <button mat-icon-button (click)="onClose()" class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          <mat-icon fontIcon="close"></mat-icon>
        </button>
      </div>

      <div class="space-y-6">
        <!-- Task Management -->
        <mat-card class="shadow-soft border border-neutral-200 dark:border-neutral-700">
          <mat-card-header>
            <mat-card-title class="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              <mat-icon fontIcon="task_alt" class="mr-2 text-accent-600 dark:text-accent-400"></mat-icon>
              Task Management
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Create new task</span>
                <div class="flex space-x-2">
                  <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+N</kbd>
                  <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">F2</kbd>
                  <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+Plus</kbd>
                </div>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Force create task (anywhere)</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+Shift+N</kbd>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Close dialog/panel</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Esc</kbd>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Navigation -->
        <mat-card class="shadow-soft border border-neutral-200 dark:border-neutral-700">
          <mat-card-header>
            <mat-card-title class="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              <mat-icon fontIcon="navigation" class="mr-2 text-accent-600 dark:text-accent-400"></mat-icon>
              Navigation
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Refresh tasks</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">F5</kbd>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Toggle dark mode</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+D</kbd>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Form Shortcuts -->
        <mat-card class="shadow-soft border border-neutral-200 dark:border-neutral-700">
          <mat-card-header>
            <mat-card-title class="text-lg font-medium text-neutral-900 dark:text-white flex items-center">
              <mat-icon fontIcon="edit" class="mr-2 text-accent-600 dark:text-accent-400"></mat-icon>
              Form Shortcuts
            </mat-card-title>
          </mat-card-header>
          <mat-card-content class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Focus title field (when panel open)</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+N</kbd>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Save task</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+S</kbd>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0">
                <span class="text-neutral-700 dark:text-neutral-300">Save and create new</span>
                <kbd class="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-sm font-mono">Ctrl+Shift+S</kbd>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div class="flex items-center justify-between">
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            <mat-icon fontIcon="info" class="mr-1 text-sm"></mat-icon>
            Shortcuts work globally when not typing in form fields
          </p>
          <button mat-raised-button color="primary" (click)="onClose()" class="rounded-xl">
            Got it!
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    kbd {
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .dark kbd {
      color: #d1d5db;
      background-color: #374151;
      border-color: #4b5563;
    }
  `]
})
export class KeyboardShortcutsHelpComponent {
  constructor(
    public dialogRef: MatDialogRef<KeyboardShortcutsHelpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
