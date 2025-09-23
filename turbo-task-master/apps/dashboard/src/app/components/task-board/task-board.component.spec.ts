import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskBoardComponent } from './task-board.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';

describe('TaskBoardComponent', () => {
  let component: TaskBoardComponent;
  let fixture: ComponentFixture<TaskBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskBoardComponent,
        MatIconModule,
        MatTooltipModule,
        CdkDropListGroup,
        CdkDropList,
        CdkDrag,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty task arrays', () => {
    expect(component.tasksByStatus).toEqual({
      0: [],
      1: [],
      2: [],
    });
  });

  it('should emit taskEdit event when editItem is called', () => {
    spyOn(component.taskEdit, 'emit');
    const mockTask = { id: 1, title: 'Test Task' };
    
    component.editItem(mockTask);
    
    expect(component.taskEdit.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should emit taskDelete event when deleteItem is called', () => {
    spyOn(component.taskDelete, 'emit');
    const mockTask = { id: 1, title: 'Test Task' };
    
    component.deleteItem(mockTask);
    
    expect(component.taskDelete.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should return correct priority class for different priorities', () => {
    expect(component.getPriorityClass(1)).toContain('bg-gray-100');
    expect(component.getPriorityClass(2)).toContain('bg-blue-100');
    expect(component.getPriorityClass(3)).toContain('bg-orange-100');
    expect(component.getPriorityClass(4)).toContain('bg-red-100');
  });

  it('should return correct priority label for different priorities', () => {
    expect(component.getPriorityLabel(1)).toBe('Low');
    expect(component.getPriorityLabel(2)).toBe('Medium');
    expect(component.getPriorityLabel(3)).toBe('High');
    expect(component.getPriorityLabel(4)).toBe('Urgent');
  });
});