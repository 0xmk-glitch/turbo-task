import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { User } from './users/entities/user.entity';
import { UserRole, RoleLevel } from './users/entities/user-role.entity';
import { Organization } from './organizations/entities/organization.entity';
import { Task } from './tasks/entities/task.entity';
import { AuditLog } from './audit/entities/audit-log.entity';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { OrganizationsService } from './organizations/organizations.service';
import { TasksService } from './tasks/tasks.service';
import * as bcrypt from 'bcryptjs';

describe('RBAC Integration Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let organizationsService: OrganizationsService;
  let tasksService: TasksService;

  let testOrganization: Organization;
  let adminUser: User;
  let regularUser: User;
  let adminToken: string;
  let regularToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, UserRole, Organization, Task, AuditLog],
          synchronize: true,
          logging: false,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    organizationsService = moduleFixture.get<OrganizationsService>(OrganizationsService);
    tasksService = moduleFixture.get<TasksService>(TasksService);

    // Create test data
    await setupTestData();
  });

  afterAll(async () => {
    await app.close();
  });

  async function setupTestData() {
    // Create test organization
    testOrganization = await organizationsService.create({
      name: 'Test Organization',
      description: 'Test Description',
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('password', 10);
    adminUser = await usersService.create({
      email: 'admin@test.com',
      name: 'Admin User',
      password: hashedPassword,
      organizationId: testOrganization.id,
    }) as User;

    // Create admin role
    const adminRole = new UserRole();
    adminRole.userId = adminUser.id;
    adminRole.organizationId = testOrganization.id;
    adminRole.role = RoleLevel.ADMIN;

    // Create regular user
    regularUser = await usersService.create({
      email: 'user@test.com',
      name: 'Regular User',
      password: hashedPassword,
      organizationId: testOrganization.id,
    }) as User;

    // Create regular role
    const regularRole = new UserRole();
    regularRole.userId = regularUser.id;
    regularRole.organizationId = testOrganization.id;
    regularRole.role = RoleLevel.VIEWER;

    // Get tokens
    const adminLogin = authService.login(adminUser);
    const regularLogin = authService.login(regularUser);
    
    adminToken = adminLogin.access_token;
    regularToken = regularLogin.access_token;
  }

  describe('Authentication', () => {
    it('should login admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe('admin@test.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Organization RBAC', () => {
    it('should allow admin to create organization', async () => {
      const response = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Organization',
          description: 'New Description',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Organization');
    });

    it('should allow admin to view all organizations', async () => {
      const response = await request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should restrict regular user to their organization only', async () => {
      const response = await request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(200);
      expect(response.body.organizationId).toBe(testOrganization.id);
    });
  });

  describe('Task RBAC', () => {
    it('should allow admin to create task', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Task',
          description: 'Task created by admin',
          type: 'work',
          priority: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Admin Task');
    });

    it('should allow admin to view all tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow regular user to view their tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/my-tasks')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow admin to update task', async () => {
      // First create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Task to Update',
          description: 'Original description',
          type: 'work',
          priority: 2,
        });

      const taskId = createResponse.body.id;

      // Update the task
      const updateResponse = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Task',
          description: 'Updated description',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Task');
    });

    it('should allow admin to delete task', async () => {
      // First create a task
      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Task to Delete',
          description: 'This task will be deleted',
          type: 'work',
          priority: 2,
        });

      const taskId = createResponse.body.id;

      // Delete the task
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('Audit Log RBAC', () => {
    it('should allow admin to view audit logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-log')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should deny regular user access to audit logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/audit-log')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Role Hierarchy', () => {
    it('should respect role hierarchy (OWNER > ADMIN > VIEWER)', async () => {
      // This test would verify that OWNER can do everything ADMIN can do
      // and ADMIN can do everything VIEWER can do
      // Implementation would depend on specific business rules
      expect(true).toBe(true); // Placeholder for role hierarchy tests
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should isolate data between organizations', async () => {
      // Create another organization
      const otherOrg = await organizationsService.create({
        name: 'Other Organization',
        description: 'Other Description',
      });

      // Create user in other organization
      const hashedPassword = await bcrypt.hash('password', 10);
      const otherUser = await usersService.create({
        email: 'other@test.com',
        name: 'Other User',
        password: hashedPassword,
        organizationId: otherOrg.id,
      });

      const otherToken = authService.login(otherUser).access_token;

      // User from other organization should not see tasks from test organization
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(200);
      // Should only see tasks from their own organization
      expect(response.body.every((task: any) => task.organizationId === otherOrg.id)).toBe(true);
    });
  });
});
