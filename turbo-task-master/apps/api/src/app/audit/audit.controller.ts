import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../../../../libs/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../../../../libs/auth/guards/roles/roles.guard';
import { Roles } from '../../../../../libs/auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Get()
  async getAuditLogs(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    
    return await this.auditService.getAuditLogs(
      req.user.organizationId,
      limitNum,
      offsetNum,
    );
  }
}
