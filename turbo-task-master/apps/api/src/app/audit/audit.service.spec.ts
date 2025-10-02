import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<Repository<AuditLog>>;

  const mockAuditLog = {
    id: 'audit-uuid-1',
    userId: 'user-uuid-1',
    action: 'CREATE',
    resourceType: 'TASK',
    resourceId: 'task-uuid-1',
    organizationId: 'org-uuid-1',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    details: { title: 'New Task' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create and save audit log', async () => {
      repository.create.mockReturnValue(mockAuditLog as any);
      repository.save.mockResolvedValue(mockAuditLog as any);

      const result = await service.log(
        'user-uuid-1',
        'CREATE',
        'TASK',
        'task-uuid-1',
        'org-uuid-1',
        '192.168.1.1',
        'Mozilla/5.0',
        { title: 'New Task' }
      );

      expect(result).toEqual(mockAuditLog);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        action: 'CREATE',
        resourceType: 'TASK',
        resourceId: 'task-uuid-1',
        organizationId: 'org-uuid-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        details: { title: 'New Task' },
      });
      expect(repository.save).toHaveBeenCalledWith(mockAuditLog);
    });

    it('should create audit log without optional parameters', async () => {
      const auditLogWithoutOptional = {
        ...mockAuditLog,
        ipAddress: undefined,
        userAgent: undefined,
        details: undefined,
      };

      repository.create.mockReturnValue(auditLogWithoutOptional as any);
      repository.save.mockResolvedValue(auditLogWithoutOptional as any);

      const result = await service.log(
        'user-uuid-1',
        'CREATE',
        'TASK',
        'task-uuid-1',
        'org-uuid-1'
      );

      expect(result).toEqual(auditLogWithoutOptional);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        action: 'CREATE',
        resourceType: 'TASK',
        resourceId: 'task-uuid-1',
        organizationId: 'org-uuid-1',
        ipAddress: undefined,
        userAgent: undefined,
        details: undefined,
      });
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs for organization', async () => {
      const mockAuditLogs = [mockAuditLog];
      repository.find.mockResolvedValue(mockAuditLogs as any);

      const result = await service.getAuditLogs('org-uuid-1', 50, 0);

      expect(result).toEqual(mockAuditLogs);
      expect(repository.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-uuid-1' },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 50,
        skip: 0,
      });
    });

    it('should use default pagination parameters', async () => {
      repository.find.mockResolvedValue([]);

      await service.getAuditLogs('org-uuid-1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { organizationId: 'org-uuid-1' },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 50,
        skip: 0,
      });
    });
  });
});
