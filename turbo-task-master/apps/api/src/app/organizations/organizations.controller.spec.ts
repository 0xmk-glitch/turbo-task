import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { UserRole } from '../users/entities/user.entity';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let service: jest.Mocked<OrganizationsService>;

  const mockOrganization = {
    id: 'org-uuid-1',
    name: 'Test Organization',
    description: 'Test Description',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [],
    userRoles: [],
    tasks: [],
    auditLogs: [],
  };

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    name: 'Test User',
    organizationId: 'org-uuid-1',
    userRoles: [
      {
        id: 'role-uuid-1',
        userId: 'user-uuid-1',
        organizationId: 'org-uuid-1',
        role: UserRole.ADMIN,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getUsersInOrganization: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    service = module.get(OrganizationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const createDto = {
        name: 'New Organization',
        description: 'New Description',
      };

      service.create.mockResolvedValue(mockOrganization);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockOrganization);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all organizations for admin user', async () => {
      const adminUser = {
        ...mockUser,
        userRoles: [{ role: UserRole.ADMIN }],
      };

      service.findAll.mockResolvedValue([mockOrganization]);

      const result = await controller.findAll({ user: adminUser } as any);

      expect(result).toEqual([mockOrganization]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return user organization for non-admin user', async () => {
      const regularUser = {
        ...mockUser,
        userRoles: [{ role: UserRole.VIEWER }],
      };

      service.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findAll({ user: regularUser } as any);

      expect(result).toEqual(mockOrganization);
      expect(service.findOne).toHaveBeenCalledWith(regularUser.organizationId);
    });
  });

  describe('findOne', () => {
    it('should return organization for admin user', async () => {
      const adminUser = {
        ...mockUser,
        userRoles: [{ role: UserRole.ADMIN }],
      };

      service.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne('org-uuid-1', { user: adminUser } as any);

      expect(result).toEqual(mockOrganization);
      expect(service.findOne).toHaveBeenCalledWith('org-uuid-1');
    });

    it('should return organization for user in same organization', async () => {
      const regularUser = {
        ...mockUser,
        userRoles: [{ role: UserRole.VIEWER }],
      };

      service.findOne.mockResolvedValue(mockOrganization);

      const result = await controller.findOne('org-uuid-1', { user: regularUser } as any);

      expect(result).toEqual(mockOrganization);
      expect(service.findOne).toHaveBeenCalledWith('org-uuid-1');
    });

    it('should throw error for user in different organization', async () => {
      const regularUser = {
        ...mockUser,
        organizationId: 'different-org-uuid',
        userRoles: [{ role: UserRole.VIEWER }],
      };

      service.findOne.mockResolvedValue(mockOrganization);

      await expect(controller.findOne('org-uuid-1', { user: regularUser } as any))
        .rejects.toThrow('Access denied');
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      const updateDto = {
        name: 'Updated Organization',
        description: 'Updated Description',
      };

      service.update.mockResolvedValue({ ...mockOrganization, ...updateDto });

      const result = await controller.update('org-uuid-1', updateDto);

      expect(result).toEqual({ ...mockOrganization, ...updateDto });
      expect(service.update).toHaveBeenCalledWith('org-uuid-1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove organization', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('org-uuid-1');

      expect(service.remove).toHaveBeenCalledWith('org-uuid-1');
    });
  });

  describe('getUsers', () => {
    it('should return users in organization for admin', async () => {
      const adminUser = {
        ...mockUser,
        userRoles: [{ role: UserRole.ADMIN }],
      };

      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          name: 'User 1',
          password: 'hashed',
          organizationId: 'org-uuid-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [],
          organization: null,
          createdTasks: [],
          assignedTasks: [],
          auditLogs: [],
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          name: 'User 2',
          password: 'hashed',
          organizationId: 'org-uuid-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [],
          organization: null,
          createdTasks: [],
          assignedTasks: [],
          auditLogs: [],
        },
      ];

      service.getUsersInOrganization.mockResolvedValue({
        ...mockOrganization,
        users: mockUsers,
      });

      const result = await controller.getUsers('org-uuid-1', { user: adminUser } as any);

      expect(result.users).toEqual(mockUsers);
      expect(service.getUsersInOrganization).toHaveBeenCalledWith('org-uuid-1');
    });

    it('should throw error for non-admin user accessing different organization', async () => {
      const regularUser = {
        ...mockUser,
        organizationId: 'different-org-uuid',
        userRoles: [{ role: UserRole.VIEWER }],
      };

      await expect(controller.getUsers('org-uuid-1', { user: regularUser } as any))
        .rejects.toThrow('Access denied');
    });
  });
});
