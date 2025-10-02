import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Tree, TreeChildren, TreeParent } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';

@Entity({ name: 'organizations' })
@Tree('materialized-path')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column('uuid', { nullable: true })
  parentId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @TreeParent()
  parent: Organization;

  @TreeChildren()
  children: Organization[];

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => Task, task => task.organization)
  tasks: Task[];

  @OneToMany(() => AuditLog, auditLog => auditLog.organization)
  auditLogs: AuditLog[];
}
