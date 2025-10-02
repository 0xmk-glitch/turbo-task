import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { RoleLevel } from '../users/entities/user-role.entity';
import { TaskStatus } from './entities/task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: jest.Mocked<TasksService>;

  const mockTask = {
    id: 'task-uuid-1',
    title: 'Test Task',
    description: 'Test Description',
    type: 'work' as 'work' | 'personal' | 'home',
    status: TaskStatus.TODO,
    priority: 2,
    organizationId: 'org-uuid-1',
    createdBy: 'user-uuid-1',
    assignedTo: 'user-uuid-2',
    dueDate: new Date(),
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: null,
    assignee: null,
    organization: null,
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
        role: RoleLevel.ADMIN,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByOrganization: jest.fn(),
            findByUser: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task for admin user', async () => {
      const createDto = {
        title: 'New Task',
        description: 'New Description',
        type: 'work' as 'work' | 'personal' | 'home',
        priority: 2,
      };

      service.create.mockResolvedValue(mockTask);

      const result = await controller.create(createDto, { user: mockUser } as any);

      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id, mockUser.organizationId);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for admin user', async () => {
      service.findByOrganization.mockResolvedValue([mockTask]);

      const result = await controller.findAll({ user: mockUser } as any);

      expect(result).toEqual([mockTask]);
      expect(service.findByOrganization).toHaveBeenCalledWith(mockUser.organizationId);
    });

    it('should return tasks for specific user when admin queries by user', async () => {
      const adminUser = {
        ...mockUser,
        userRoles: [{ role: RoleLevel.ADMIN }],
      };

      service.findByUser.mockResolvedValue([mockTask]);

      const result = await controller.findAll(
        { user: adminUser } as any,
        'user-uuid-2'
      );

      expect(result).toEqual([mockTask]);
      expect(service.findByUser).toHaveBeenCalledWith('user-uuid-2', adminUser.organizationId);
    });

    it('should return organization tasks for non-admin user', async () => {
      const regularUser = {
        ...mockUser,
        userRoles: [{ role: RoleLevel.VIEWER }],
      };

      service.findByOrganization.mockResolvedValue([mockTask]);

      const result = await controller.findAll({ user: regularUser } as any);

      expect(result).toEqual([mockTask]);
      expect(service.findByOrganization).toHaveBeenCalledWith(regularUser.organizationId);
    });
  });

  describe('getMyTasks', () => {
    it('should return user tasks', async () => {
      service.findByUser.mockResolvedValue([mockTask]);

      const result = await controller.getMyTasks({ user: mockUser } as any);

      expect(result).toEqual([mockTask]);
      expect(service.findByUser).toHaveBeenCalledWith(mockUser.id, mockUser.organizationId);
    });
  });

  describe('findOne', () => {
    it('should return task by id', async () => {
      service.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne('task-uuid-1', { user: mockUser } as any);

      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith('task-uuid-1', mockUser.organizationId);
    });
  });

  describe('update', () => {
    it('should update task for admin user', async () => {
      const updateDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      service.update.mockResolvedValue({ ...mockTask, ...updateDto });

      const result = await controller.update('task-uuid-1', updateDto, { user: mockUser } as any);

      expect(result).toEqual({ ...mockTask, ...updateDto });
      expect(service.update).toHaveBeenCalledWith('task-uuid-1', updateDto, mockUser.organizationId);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      service.updateStatus.mockResolvedValue({ ...mockTask, status: TaskStatus.IN_PROGRESS });

      const result = await controller.updateStatus(
        'task-uuid-1',
        TaskStatus.IN_PROGRESS,
        { user: mockUser } as any
      );

      expect(result).toEqual({ ...mockTask, status: TaskStatus.IN_PROGRESS });
      expect(service.updateStatus).toHaveBeenCalledWith(
        'task-uuid-1',
        TaskStatus.IN_PROGRESS,
        mockUser.organizationId
      );
    });
  });

  describe('remove', () => {
    it('should remove task for admin user', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('task-uuid-1', { user: mockUser } as any);

      expect(service.remove).toHaveBeenCalledWith('task-uuid-1', mockUser.organizationId);
    });
  });
});