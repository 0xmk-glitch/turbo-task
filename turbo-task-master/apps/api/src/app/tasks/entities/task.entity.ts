import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
  CANCELLED = 3
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', enum: ['work', 'personal', 'home'] })
  type: string;

  @Column({ type: 'int', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'int', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column('uuid')
  organizationId: string;

  @Column('uuid')
  createdBy: string;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.createdTasks, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User, user => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee: User;

  @ManyToOne(() => Organization, organization => organization.tasks, { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
