/**
 * Example Controller with Integrated Logging
 * 
 * This example shows how to use the centralized logging system
 * in a NestJS controller for comprehensive API monitoring.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggingService } from '../services/logging.service';
import { AuditLoggerService } from '../audit/audit-logger.service';
import { JwtAuthGuard } from '../../../../../libs/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('example')
@UseGuards(JwtAuthGuard)
export class ExampleController {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly auditLoggerService: AuditLoggerService,
  ) {}

  @Get('tasks')
  async getTasks(@Req() req) {
    const requestId = req.requestId;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    try {
      // Log the operation start
      this.loggingService.info('Fetching tasks for user', {
        requestId,
        userId,
        organizationId,
        operation: 'get_tasks'
      });

      // Simulate fetching tasks
      const tasks = await this.fetchTasksFromDatabase(userId, organizationId);

      // Log successful operation
      this.loggingService.info('Tasks fetched successfully', {
        requestId,
        userId,
        organizationId,
        taskCount: tasks.length
      });

      // Audit log for compliance
      await this.auditLoggerService.logAuditEvent({
        action: 'GET_TASKS',
        resourceType: 'TASK',
        resourceId: undefined,
        userId,
        organizationId,
        requestId,
        outcome: 'success',
        details: {
          taskCount: tasks.length,
          filters: req.query
        }
      });

      return {
        success: true,
        data: tasks,
        count: tasks.length
      };

    } catch (error) {
      // Log error with context
      this.loggingService.error('Failed to fetch tasks', error, {
        requestId,
        userId,
        organizationId,
        operation: 'get_tasks'
      });

      // Audit log for failure
      await this.auditLoggerService.logAuditEvent({
        action: 'GET_TASKS',
        resourceType: 'TASK',
        resourceId: undefined,
        userId,
        organizationId,
        requestId,
        outcome: 'failure',
        details: {
          error: error.message,
          filters: req.query
        }
      });

      throw new HttpException(
        'Failed to fetch tasks',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('tasks')
  async createTask(@Body() createTaskDto: any, @Req() req) {
    const requestId = req.requestId;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    try {
      // Log task creation attempt
      this.loggingService.info('Creating new task', {
        requestId,
        userId,
        organizationId,
        operation: 'create_task',
        taskData: {
          title: createTaskDto.title,
          priority: createTaskDto.priority
        }
      });

      // Validate input
      if (!createTaskDto.title) {
        throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
      }

      // Create task
      const task = await this.createTaskInDatabase({
        ...createTaskDto,
        userId,
        organizationId
      });

      // Log successful creation
      this.loggingService.info('Task created successfully', {
        requestId,
        userId,
        organizationId,
        taskId: task.id,
        operation: 'create_task'
      });

      // Audit log for compliance
      await this.auditLoggerService.logAuditEvent({
        action: 'CREATE_TASK',
        resourceType: 'TASK',
        resourceId: task.id,
        userId,
        organizationId,
        requestId,
        outcome: 'success',
        details: {
          taskId: task.id,
          taskTitle: task.title,
          priority: task.priority
        }
      });

      return {
        success: true,
        data: task
      };

    } catch (error) {
      // Log error with context
      this.loggingService.error('Failed to create task', error, {
        requestId,
        userId,
        organizationId,
        operation: 'create_task',
        taskData: createTaskDto
      });

      // Audit log for failure
      await this.auditLoggerService.logAuditEvent({
        action: 'CREATE_TASK',
        resourceType: 'TASK',
        resourceId: undefined,
        userId,
        organizationId,
        requestId,
        outcome: 'failure',
        details: {
          error: error.message,
          taskData: createTaskDto
        }
      });

      // Re-throw HTTP exceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to create task',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string, @Req() req) {
    const requestId = req.requestId;
    const userId = req.user?.id;
    const organizationId = req.user?.organizationId;

    try {
      // Log task retrieval attempt
      this.loggingService.debug('Fetching specific task', {
        requestId,
        userId,
        organizationId,
        taskId: id,
        operation: 'get_task'
      });

      const task = await this.fetchTaskFromDatabase(id, userId, organizationId);

      if (!task) {
        // Log not found
        this.loggingService.info('Task not found', {
          requestId,
          userId,
          organizationId,
          taskId: id,
          operation: 'get_task'
        });

        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      // Log successful retrieval
      this.loggingService.debug('Task retrieved successfully', {
        requestId,
        userId,
        organizationId,
        taskId: id,
        operation: 'get_task'
      });

      // Audit log
      await this.auditLoggerService.logAuditEvent({
        action: 'GET_TASK',
        resourceType: 'TASK',
        resourceId: id,
        userId,
        organizationId,
        requestId,
        outcome: 'success',
        details: { taskId: id }
      });

      return {
        success: true,
        data: task
      };

    } catch (error) {
      // Log error
      this.loggingService.error('Failed to fetch task', error, {
        requestId,
        userId,
        organizationId,
        taskId: id,
        operation: 'get_task'
      });

      // Audit log for failure
      await this.auditLoggerService.logAuditEvent({
        action: 'GET_TASK',
        resourceType: 'TASK',
        resourceId: id,
        userId,
        organizationId,
        requestId,
        outcome: 'failure',
        details: {
          error: error.message,
          taskId: id
        }
      });

      // Re-throw HTTP exceptions as-is
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch task',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Mock database methods
  private async fetchTasksFromDatabase(userId: string, organizationId: string) {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      { id: '1', title: 'Task 1', userId, organizationId },
      { id: '2', title: 'Task 2', userId, organizationId }
    ];
  }

  private async createTaskInDatabase(taskData: any) {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      id: 'task-' + Date.now(),
      ...taskData,
      createdAt: new Date()
    };
  }

  private async fetchTaskFromDatabase(id: string, userId: string, organizationId: string) {
    // Simulate database call
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulate task not found for certain IDs
    if (id === 'not-found') {
      return null;
    }
    
    return {
      id,
      title: `Task ${id}`,
      userId,
      organizationId,
      createdAt: new Date()
    };
  }
}

/**
 * Example Log Outputs:
 * 
 * 1. Successful GET /api/example/tasks:
 * {
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "level": "INFO",
 *   "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *   "service": "turbo-task-api",
 *   "message": "API Request",
 *   "metadata": {
 *     "requestId": "req-123",
 *     "method": "GET",
 *     "route": "/api/example/tasks",
 *     "userId": "user-456",
 *     "organizationId": "org-789"
 *   }
 * }
 * 
 * 2. Task creation with error:
 * {
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "level": "ERROR",
 *   "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *   "service": "turbo-task-api",
 *   "message": "Failed to create task",
 *   "metadata": {
 *     "requestId": "req-124",
 *     "userId": "user-456",
 *     "organizationId": "org-789",
 *     "operation": "create_task",
 *     "taskData": {
 *       "title": "New Task",
 *       "priority": "high"
 *     },
 *     "error": {
 *       "name": "ValidationError",
 *       "message": "Title is required"
 *     }
 *   }
 * }
 * 
 * 3. Audit log for compliance:
 * {
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "level": "INFO",
 *   "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *   "service": "turbo-task-api",
 *   "message": "Audit Log",
 *   "metadata": {
 *     "action": "CREATE_TASK",
 *     "resource": "/api/example/tasks",
 *     "userId": "user-456",
 *     "organizationId": "org-789",
 *     "requestId": "req-124",
 *     "outcome": "success",
 *     "metadata": {
 *       "taskId": "task-1705312200000",
 *       "taskTitle": "New Task",
 *       "priority": "high"
 *     }
 *   }
 * }
 */
