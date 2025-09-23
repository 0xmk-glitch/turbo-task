import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { CreateTaskDto } from 'libs/data/dto/task/create-task.dto';

@Component({
  selector: 'app-task-board',
  imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss',
})
export class TaskBoardComponent {
  @Input() tasksByStatus: { [status: number]: any[] } | undefined = {
    0: [],
    1: [],
    2: [],
  };

  @Output() taskEdit = new EventEmitter<any>();
  @Output() taskDelete = new EventEmitter<any>();
  @Output() taskStatusChange = new EventEmitter<{task: any, newStatus: number}>();

  drop(event: CdkDragDrop<any[]>) {
    console.log(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Emit status change event
      const task = event.item.data;
      const newStatus = this.getStatusFromContainerId(event.container.id);
      this.taskStatusChange.emit({ task, newStatus });
    }
  }

  private getStatusFromContainerId(containerId: string): number {
    // This would need to be implemented based on how you identify containers
    // For now, return 0 as default
    return 0;
  }

  deleteItem(item: any) {
    this.taskDelete.emit(item);
  }

  editItem(item: any) {
    this.taskEdit.emit(item);
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
      case 2: return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 3: return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 4: return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
    }
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Medium';
    }
  }

  isOverdue(dueDate: string | Date): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const diffTime = d.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return d.toLocaleDateString();
  }
}
