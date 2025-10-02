import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CentralizedLogger } from '../utils/logger.util';

export interface AuditLogData {
  action: string;
  resourceType: string;
  resourceId?: string;
  userId?: string;
  organizationId?: string;
  requestId?: string;
  outcome: 'success' | 'failure';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  route?: string;
  statusCode?: number;
  duration?: number;
}

@Injectable()
export class AuditLoggerService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly logger: CentralizedLogger,
  ) {}

  async logAuditEvent(auditData: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        action: auditData.action,
        resourceType: auditData.resourceType,
        resourceId: auditData.resourceId,
        userId: auditData.userId,
        organizationId: auditData.organizationId,
        details: {
          ...auditData.details,
          requestId: auditData.requestId,
          outcome: auditData.outcome,
          method: auditData.method,
          route: auditData.route,
          statusCode: auditData.statusCode,
          duration: auditData.duration,
        },
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
      });

      await this.auditLogRepository.save(auditLog);

      // Also log to console/file for immediate visibility
      this.logger.logAudit(
        auditData.action,
        auditData.resourceType,
        auditData.userId,
        auditData.organizationId,
        auditData.requestId,
        auditData.outcome,
        {
          ...auditData.details,
          ipAddress: auditData.ipAddress,
          userAgent: auditData.userAgent,
          method: auditData.method,
          route: auditData.route,
          statusCode: auditData.statusCode,
          duration: auditData.duration,
        }
      );
    } catch (error) {
      this.logger.error('Failed to save audit log', error, { auditData });
    }
  }

  async getAuditLogs(
    userId?: string,
    organizationId?: string,
    action?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    if (userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId });
    }

    if (organizationId) {
      queryBuilder.andWhere('auditLog.organizationId = :organizationId', { organizationId });
    }

    if (action) {
      queryBuilder.andWhere('auditLog.action = :action', { action });
    }

    if (resource) {
      queryBuilder.andWhere('auditLog.resource = :resource', { resource });
    }

    if (startDate) {
      queryBuilder.andWhere('auditLog.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('auditLog.createdAt <= :endDate', { endDate });
    }

    const [logs, total] = await queryBuilder
      .orderBy('auditLog.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return { logs, total };
  }

  async getAuditStats(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalActions: number;
    successRate: number;
    topActions: Array<{ action: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    if (organizationId) {
      queryBuilder.andWhere('auditLog.organizationId = :organizationId', { organizationId });
    }

    if (startDate) {
      queryBuilder.andWhere('auditLog.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('auditLog.createdAt <= :endDate', { endDate });
    }

    const totalActions = await queryBuilder.getCount();

    const successCount = await queryBuilder
      .clone()
      .andWhere('auditLog.outcome = :outcome', { outcome: 'success' })
      .getCount();

    const topActions = await queryBuilder
      .clone()
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topResources = await queryBuilder
      .clone()
      .select('auditLog.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.resource')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalActions,
      successRate: totalActions > 0 ? (successCount / totalActions) * 100 : 0,
      topActions,
      topResources,
    };
  }
}
