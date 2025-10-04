import { Component, Inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CreateTaskDto } from 'libs/data/dto/task/create-task.dto';

// Import UI components
import { ButtonComponent } from '../ui/button/button.component';
import { InputComponent } from '../ui/input/input.component';
import { DropdownComponent, DropdownOption } from '../ui/dropdown/dropdown.component';
import { TextareaComponent } from '../ui/textarea/textarea.component';

@Component({
  selector: 'app-create-task-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
    // UI Components
    ButtonComponent,
    InputComponent,
    DropdownComponent,
    TextareaComponent,
  ],
  templateUrl: './create-task-panel.component.html',
  styleUrl: './create-task-panel.component.scss',
})
export class CreateTaskPanelComponent implements OnInit, OnDestroy {
  taskForm!: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  taskData: CreateTaskDto | null = null;

  // Dropdown options
  taskTypeOptions: DropdownOption[] = [
    { value: 'work', label: 'Work', icon: 'work', iconClass: 'text-sm text-accent-600' },
    { value: 'personal', label: 'Personal', icon: 'person', iconClass: 'text-sm text-green-600' },
    { value: 'home', label: 'Home', icon: 'home', iconClass: 'text-sm text-purple-600' }
  ];

  priorityOptions: DropdownOption[] = [
    { value: 1, label: 'Low', icon: 'circle', iconClass: 'w-3 h-3 bg-green-500 rounded-full' },
    { value: 2, label: 'Medium', icon: 'circle', iconClass: 'w-3 h-3 bg-yellow-500 rounded-full' },
    { value: 3, label: 'High', icon: 'circle', iconClass: 'w-3 h-3 bg-orange-500 rounded-full' },
    { value: 4, label: 'Urgent', icon: 'circle', iconClass: 'w-3 h-3 bg-red-500 rounded-full' }
  ];

  statusOptions: DropdownOption[] = [
    { value: 0, label: 'To Do', icon: 'pending', iconClass: 'text-sm text-accent-600' },
    { value: 1, label: 'In Progress', icon: 'work', iconClass: 'text-sm text-orange-600' },
    { value: 2, label: 'Done', icon: 'check_circle', iconClass: 'text-sm text-green-600' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTaskPanelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskData?: CreateTaskDto; isEdit?: boolean }
  ) {
    this.taskData = data?.taskData || null;
    this.isEditMode = data?.isEdit || false;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.taskData) {
      this.populateForm();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.onCancel();
  }

  @HostListener('document:keydown.ctrl.n', ['$event'])
  onCtrlN(event: KeyboardEvent) {
    if (!this.isEditMode) {
      event.preventDefault();
      // Focus on title field
      setTimeout(() => {
        const titleField = document.querySelector('input[formControlName="title"]') as HTMLInputElement;
        if (titleField) {
          titleField.focus();
        }
      }, 100);
    }
  }

  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: ['work', Validators.required],
      priority: [2], // Default to Medium priority
      status: [0], // Default to To Do
      dueDate: [null]
    });
  }

  private populateForm(): void {
    if (this.taskData) {
      this.taskForm.patchValue({
        title: this.taskData.title || '',
        description: this.taskData.description || '',
        type: this.taskData.type || 'work',
        priority: this.taskData.priority || 2,
        status: this.taskData.status || 0,
        dueDate: this.taskData.dueDate ? new Date(this.taskData.dueDate) : null
      });
    }
  }

  private resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      type: 'work',
      priority: 2,
      status: 0,
      dueDate: null
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      
      const formValue = this.taskForm.value;
      const taskData: CreateTaskDto = {
        ...formValue,
        dueDate: formValue.dueDate ? formValue.dueDate.toISOString() : undefined,
        id: this.isEditMode ? this.taskData?.id : undefined,
        createdAt: this.isEditMode ? this.taskData?.createdAt : new Date(),
        updatedAt: new Date()
      };

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.dialogRef.close(taskData);
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSaveAndNew(): void {
    if (this.taskForm.valid) {
      this.onSubmit();
      if (!this.isEditMode) {
        // Reset form for new task
        setTimeout(() => {
          this.resetForm();
        }, 100);
      }
    }
  }

  // Helper method to get form control for template
  getFormControl(controlName: string) {
    return this.taskForm.get(controlName);
  }

  // Error message helpers
  getTitleErrorMessage(): string {
    const control = this.taskForm.get('title');
    if (control?.hasError('required')) {
      return 'Title is required';
    }
    if (control?.hasError('minlength')) {
      return 'Title must be at least 3 characters';
    }
    return '';
  }

  getTypeErrorMessage(): string {
    const control = this.taskForm.get('type');
    if (control?.hasError('required')) {
      return 'Type is required';
    }
    return '';
  }
}
