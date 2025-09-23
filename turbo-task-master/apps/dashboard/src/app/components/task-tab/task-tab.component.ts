import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MasterService } from '../../_service/master.service';
import { CreateTaskDto } from 'libs/data/dto/task/create-task.dto';
import { RouterModule } from '@angular/router';
import { TaskBoardComponent } from '../task-board/task-board.component';
import { CreateTaskComponent } from '../tasks/create-task.component';

@Component({
  selector: 'app-task-tab',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    TaskBoardComponent,
  ],
  templateUrl: './task-tab.component.html',
  styleUrl: './task-tab.component.scss',
})
export class TaskTabComponent implements OnInit {
  constructor(
    private service: MasterService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  tasklist!: any[];
  titles: string[] = [];
  selectedTabIndex = 0;
  selectedPriority = '';
  searchTerm = '';
  
  groupedTasks: { [type: string]: { [status: number]: any[] } } = {
    work: {
      0: [],
      1: [],
      2: [],
    },
    personal: {
      0: [],
      1: [],
      2: [],
    },
    home: {
      0: [],
      1: [],
      2: [],
    },
  };

  filteredTasks: { [type: string]: { [status: number]: any[] } } = {
    work: {
      0: [],
      1: [],
      2: [],
    },
    personal: {
      0: [],
      1: [],
      2: [],
    },
    home: {
      0: [],
      1: [],
      2: [],
    },
  };

  loadTasks() {
    this.service.Loadtasks().subscribe((items) => {
      this.tasklist = items;
      console.log(this.tasklist);

      // Grouping logic: type > status > items[]
      this.groupedTasks = {
        work: { 0: [], 1: [], 2: [] },
        personal: { 0: [], 1: [], 2: [] },
        home: { 0: [], 1: [], 2: [] },
      };
      
      for (const task of items) {
        const { type, status } = task;

        if (type && status !== undefined) {
          if (!this.groupedTasks[type]) {
            this.groupedTasks[type] = { 0: [], 1: [], 2: [] };
          }
          if (!this.groupedTasks[type][status]) {
            this.groupedTasks[type][status] = [];
          }

          this.groupedTasks[type][status].push(task);
        }
      }
      
      // Apply current filters
      this.filterTasks();
    });
  }

  filterTasks() {
    // Reset filtered tasks
    this.filteredTasks = {
      work: { 0: [], 1: [], 2: [] },
      personal: { 0: [], 1: [], 2: [] },
      home: { 0: [], 1: [], 2: [] },
    };

    // Apply filters to each category
    Object.keys(this.groupedTasks).forEach(category => {
      Object.keys(this.groupedTasks[category]).forEach(status => {
        const statusNum = parseInt(status);
        this.filteredTasks[category][statusNum] = this.groupedTasks[category][statusNum].filter(task => {
          // Priority filter
          const priorityMatch = !this.selectedPriority || task.priority?.toString() === this.selectedPriority;
          
          // Search filter
          const searchMatch = !this.searchTerm || 
            task.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
          
          return priorityMatch && searchMatch;
        });
      });
    });
  }

  getTotalTasks(): number {
    return this.tasklist?.length || 0;
  }

  getInProgressTasks(): number {
    return this.tasklist?.filter(task => task.status === 1).length || 0;
  }

  getCompletedTasks(): number {
    return this.tasklist?.filter(task => task.status === 2).length || 0;
  }

  getOverdueTasks(): number {
    const today = new Date();
    return this.tasklist?.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== 2;
    }).length || 0;
  }

  openCreateTaskDialog() {
    const dialogRef = this.dialog.open(CreateTaskComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { 
        taskData: null, 
        isEdit: false 
      },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addNewTask(result);
      }
    });
  }

  private getCurrentTabType(): 'work' | 'personal' | 'home' {
    const types = ['work', 'personal', 'home'];
    return types[this.selectedTabIndex] as 'work' | 'personal' | 'home';
  }

  private addNewTask(taskData: CreateTaskDto) {
    const newTask = {
      ...taskData,
      id: Date.now(), // Simple ID generation for demo
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to the appropriate category and status
    this.groupedTasks[taskData.type][0].push(newTask);
    
    // Refresh the filtered tasks
    this.filterTasks();
    
    this.snackBar.open(`Task "${taskData.title}" created successfully!`, 'Close', {
      duration: 3000,
    });
  }

  private updateTask(taskData: CreateTaskDto) {
    // Find and update the task in groupedTasks
    Object.keys(this.groupedTasks).forEach(category => {
      Object.keys(this.groupedTasks[category]).forEach(status => {
        const statusNum = parseInt(status);
        const taskIndex = this.groupedTasks[category][statusNum].findIndex(task => task.id === taskData.id);
        if (taskIndex !== -1) {
          this.groupedTasks[category][statusNum][taskIndex] = {
            ...this.groupedTasks[category][statusNum][taskIndex],
            ...taskData,
            updatedAt: new Date()
          };
        }
      });
    });
    
    // Refresh the filtered tasks
    this.filterTasks();
    
    this.snackBar.open(`Task "${taskData.title}" updated successfully!`, 'Close', {
      duration: 3000,
    });
  }

  refreshTasks() {
    this.loadTasks();
    this.snackBar.open('Tasks refreshed', 'Close', {
      duration: 2000,
    });
  }

  onTaskEdit(task: any) {
    const dialogRef = this.dialog.open(CreateTaskComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { 
        taskData: task, 
        isEdit: true 
      },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTask(result);
      }
    });
  }

  onTaskDelete(task: any) {
    // TODO: Implement delete confirmation
    this.snackBar.open(`Delete task: ${task.title}`, 'Close', {
      duration: 3000,
    });
  }

  onTaskStatusChange(event: {task: any, newStatus: number}) {
    // TODO: Implement status update API call
    this.snackBar.open(`Task status changed to ${event.newStatus}`, 'Close', {
      duration: 3000,
    });
  }

  getTotalTasksByType(type: string): number {
    const tasks = this.groupedTasks[type] || { 0: [], 1: [], 2: [] };
    return (tasks[0]?.length || 0) + (tasks[1]?.length || 0) + (tasks[2]?.length || 0);
  }
}
