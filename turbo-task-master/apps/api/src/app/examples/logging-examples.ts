/**
 * Logging System Examples
 * 
 * This file demonstrates how to use the centralized logging system
 * in your NestJS application.
 */

import { Injectable } from '@nestjs/common';
import { LoggingService } from '../services/logging.service';
import { AuditLoggerService } from '../audit/audit-logger.service';
import { LogLevel } from '../utils/logger.util';

@Injectable()
export class LoggingExamplesService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly auditLoggerService: AuditLoggerService,
  ) {}

  // Example 1: Basic logging
  async basicLoggingExample() {
    // Debug logging (only shown if LOG_LEVEL=DEBUG)
    this.loggingService.debug('Debug message', { userId: '123', action: 'test' });
    
    // Info logging (shown if LOG_LEVEL=INFO or DEBUG)
    this.loggingService.info('User action completed', { 
      userId: '123', 
      action: 'create_task',
      taskId: 'task-456' 
    });
    
    // Error logging (always shown)
    try {
      throw new Error('Something went wrong');
    } catch (error) {
      this.loggingService.error('Failed to process request', error, {
        userId: '123',
        requestId: 'req-789',
        context: 'task_creation'
      });
    }
  }

  // Example 2: Audit logging
  async auditLoggingExample() {
    const userId = 'user-123';
    const organizationId = 'org-456';
    const requestId = 'req-789';

    // Log successful action
    await this.auditLoggerService.logAuditEvent({
      action: 'CREATE_TASK',
      resourceType: 'TASK',
      resourceId: 'task-123',
      userId,
      organizationId,
      requestId,
      outcome: 'success',
      details: {
        taskId: 'task-123',
        taskTitle: 'New Task',
        priority: 'high'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      method: 'POST',
      route: '/api/tasks',
      statusCode: 201,
      duration: 150
    });

    // Log failed action
    await this.auditLoggerService.logAuditEvent({
      action: 'DELETE_TASK',
      resourceType: 'TASK',
      resourceId: 'task-123',
      userId,
      organizationId,
      requestId,
      outcome: 'failure',
      details: {
        taskId: 'task-123',
        error: 'Task not found'
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      method: 'DELETE',
      route: '/api/tasks/task-123',
      statusCode: 404,
      duration: 50
    });
  }

  // Example 3: Performance logging
  async performanceLoggingExample() {
    const startTime = Date.now();
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const duration = Date.now() - startTime;
    
    // Log performance metrics
    this.loggingService.logPerformance(
      'database_query',
      duration,
      'req-123',
      'user-456',
      'org-789',
      {
        query: 'SELECT * FROM tasks WHERE userId = ?',
        recordCount: 25,
        cacheHit: false
      }
    );
  }

  // Example 4: Child logger for specific operations
  async childLoggerExample() {
    // Create a child logger for this specific operation
    const childLogger = this.loggingService.createChildLogger();
    
    childLogger.info('Starting complex operation', {
      operationId: 'op-123',
      userId: 'user-456'
    });
    
    // All logs from this child logger will have the same correlation ID
    childLogger.debug('Step 1 completed', { step: 1 });
    childLogger.debug('Step 2 completed', { step: 2 });
    childLogger.info('Complex operation completed', {
      operationId: 'op-123',
      totalSteps: 2
    });
  }

  // Example 5: Configuration management
  async configurationExample() {
    // Get current configuration
    const config = this.loggingService.getConfig();
    console.log('Current logging config:', config);
    
    // Update configuration at runtime
    this.loggingService.updateConfig({
      logLevel: LogLevel.DEBUG,
      enablePerformanceLogging: true
    });
    
    // This will now be logged because we set logLevel to DEBUG
    this.loggingService.debug('This debug message will now be visible');
  }
}

/**
 * Example log outputs:
 * 
 * JSON Format (LOG_FORMAT=json):
 * {
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "level": "INFO",
 *   "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *   "service": "turbo-task-api",
 *   "message": "API Request",
 *   "metadata": {
 *     "requestId": "req-123",
 *     "method": "POST",
 *     "route": "/api/tasks",
 *     "userId": "user-456",
 *     "organizationId": "org-789",
 *     "body": {
 *       "title": "New Task",
 *       "description": "Task description",
 *       "password": "[REDACTED]"
 *     }
 *   }
 * }
 * 
 * Pretty Format (LOG_FORMAT=pretty):
 * [2024-01-15T10:30:00.000Z] INFO  [550e8400] API Request | POST /api/tasks | 201 | 150ms | user:user-456 | org:org-789
 * 
 * Audit Log:
 * {
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "level": "INFO",
 *   "correlationId": "550e8400-e29b-41d4-a716-446655440000",
 *   "service": "turbo-task-api",
 *   "message": "Audit Log",
 *   "metadata": {
 *     "action": "CREATE_TASK",
 *     "resource": "/api/tasks",
 *     "userId": "user-456",
 *     "organizationId": "org-789",
 *     "requestId": "req-123",
 *     "outcome": "success",
 *     "ipAddress": "192.168.1.100",
 *     "userAgent": "Mozilla/5.0...",
 *     "method": "POST",
 *     "route": "/api/tasks",
 *     "statusCode": 201,
 *     "duration": 150
 *   }
 * }
 */
