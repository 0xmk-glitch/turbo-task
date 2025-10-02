import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    organizationId: string,
    ipAddress?: string,
    userAgent?: string,
    details?: any,
  ) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      organizationId,
      ipAddress,
      userAgent,
      details,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(organizationId: string, limit: number = 50, offset: number = 0) {
    return await this.auditLogRepository.find({
      where: { organizationId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
