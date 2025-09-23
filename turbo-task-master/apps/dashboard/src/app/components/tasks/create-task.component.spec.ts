import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateTaskComponent } from './create-task.component';

describe('CreateTaskComponent', () => {
  let component: CreateTaskComponent;
  let fixture: ComponentFixture<CreateTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CreateTaskComponent,
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
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.taskForm.get('title')?.value).toBe('');
    expect(component.taskForm.get('type')?.value).toBe('work');
    expect(component.taskForm.get('priority')?.value).toBe(2);
    expect(component.taskForm.get('status')?.value).toBe(0);
  });

  it('should validate required fields', () => {
    const titleControl = component.taskForm.get('title');
    const typeControl = component.taskForm.get('type');

    expect(titleControl?.hasError('required')).toBeTruthy();
    expect(typeControl?.hasError('required')).toBeFalsy(); // Has default value

    titleControl?.setValue('Test Task');
    expect(titleControl?.hasError('required')).toBeFalsy();
  });

  it('should emit task data on submit', () => {
    spyOn(component.taskSubmit, 'emit');
    
    component.taskForm.patchValue({
      title: 'Test Task',
      type: 'work',
      priority: 2
    });

    component.onSubmit();
    expect(component.taskSubmit.emit).toHaveBeenCalled();
  });

  it('should emit cancel event on cancel', () => {
    spyOn(component.taskCancel, 'emit');
    component.onCancel();
    expect(component.taskCancel.emit).toHaveBeenCalled();
  });
});
