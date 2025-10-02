import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { RoleLevel } from '../../../apps/api/src/app/users/entities/user-role.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { userRoles: [] },
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([RoleLevel.ADMIN]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: {
          userRoles: [
            { role: RoleLevel.ADMIN },
            { role: RoleLevel.VIEWER },
          ],
        },
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has any of the required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([RoleLevel.ADMIN, RoleLevel.OWNER]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: {
          userRoles: [{ role: RoleLevel.OWNER }],
        },
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([RoleLevel.ADMIN]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: {
          userRoles: [{ role: RoleLevel.VIEWER }],
        },
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      reflector.getAllAndOverride.mockReturnValue([RoleLevel.ADMIN]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { userRoles: [] },
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      reflector.getAllAndOverride.mockReturnValue([RoleLevel.ADMIN]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: null,
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should handle userRoles being undefined', () => {
      reflector.getAllAndOverride.mockReturnValue([RoleLevel.ADMIN]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue({
        user: { userRoles: undefined },
      });

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });
  });
});