import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  action: string;

  @Column()
  resourceType: string;

  @Column('uuid', { nullable: true })
  resourceId: string;

  @Column('uuid')
  organizationId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'json', nullable: true })
  details: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.auditLogs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, organization => organization.auditLogs)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;
}
