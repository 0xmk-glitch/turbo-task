import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole, RoleLevel } from '../users/entities/user-role.entity';
import { Organization } from '../organizations/entities/organization.entity';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    organizationId: 'org-uuid-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [
      {
        id: 'role-uuid-1',
        userId: 'user-uuid-1',
        organizationId: 'org-uuid-1',
        role: RoleLevel.ADMIN,
        user: null,
        organization: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    organization: {
      id: 'org-uuid-1',
      name: 'Test Organization',
      description: 'Test Org Description',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [],
      userRoles: [],
      tasks: [],
      auditLogs: [],
    },
    createdTasks: [],
    assignedTasks: [],
    auditLogs: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      usersService.findOne.mockResolvedValue(mockUser as any);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.validateUser('test@example.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser as any);

      await expect(service.validateUser('test@example.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.validateUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        id: 'new-user-uuid',
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedPassword',
        organizationId: 'org-uuid-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [],
        organization: null,
        createdTasks: [],
        assignedTasks: [],
        auditLogs: [],
      };

      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      usersService.create.mockResolvedValue(newUser as any);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(
        'new@example.com',
        'password',
        'New User',
        'org-uuid-1'
      );

      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'hashedPassword',
        name: 'New User',
        organizationId: 'org-uuid-1',
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(service.register(
        'test@example.com',
        'password',
        'Test User',
        'org-uuid-1'
      )).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token and user data', () => {
      jwtService.sign.mockReturnValue('jwt-token');

      const result = service.login(mockUser);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: 'user-uuid-1',
          email: 'test@example.com',
          name: 'Test User',
          role: RoleLevel.ADMIN,
          organizationId: 'org-uuid-1',
        },
      });
    });

    it('should handle user without roles', () => {
      const userWithoutRoles = { ...mockUser, userRoles: [] };
      jwtService.sign.mockReturnValue('jwt-token');

      const result = service.login(userWithoutRoles);

      expect(result.user.role).toBe('VIEWER');
    });
  });
});