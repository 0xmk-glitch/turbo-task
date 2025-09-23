import { Component, Inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CreateTaskDto } from 'libs/data/dto/task/create-task.dto';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss',
})
export class CreateTaskComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  taskData: CreateTaskDto | null = null;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTaskComponent>,
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

  // Helper method to get form control for template
  getFormControl(controlName: string) {
    return this.taskForm.get(controlName);
  }
}
