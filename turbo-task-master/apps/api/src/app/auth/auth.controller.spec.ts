import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RoleLevel } from '../users/entities/user-role.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

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
    organization: null,
    createdTasks: [],
    assignedTasks: [],
    auditLogs: [],
  };

  const mockLoginResponse = {
    access_token: 'jwt-token',
    user: {
      id: 'user-uuid-1',
      email: 'test@example.com',
      name: 'Test User',
      role: RoleLevel.ADMIN,
      organizationId: 'org-uuid-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockReturnValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.validateUser.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password',
        name: 'New User',
        organizationId: 'org-uuid-1',
      };

      const mockRegisterResponse = {
        access_token: 'jwt-token',
        user: {
          id: 'new-user-uuid',
          email: 'new@example.com',
          name: 'New User',
          role: RoleLevel.VIEWER,
          organizationId: 'org-uuid-1',
        },
      };

      authService.register.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockRegisterResponse);
      expect(authService.register).toHaveBeenCalledWith(
        'new@example.com',
        'password',
        'New User',
        'org-uuid-1'
      );
    });

    it('should throw error when user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password',
        name: 'Existing User',
        organizationId: 'org-uuid-1',
      };

      authService.register.mockRejectedValue(new Error('User already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow('User already exists');
    });
  });
});