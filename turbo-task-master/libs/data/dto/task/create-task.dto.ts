export class CreateTaskDto {
  id?: number;
  title!: string;
  description?: string;
  type!: 'work' | 'personal' | 'home';
  status?: number; // 0: TODO, 1: IN_PROGRESS, 2: DONE, 3: CANCELLED
  priority?: 1 | 2 | 3 | 4; // LOW, MEDIUM, HIGH, URGENT
  assignedTo?: number;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
