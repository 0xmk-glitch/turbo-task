import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CentralizedLogger } from '../utils/logger.util';
import { AuditLoggerService } from '../audit/audit-logger.service';
import { LoggingConfig } from '../config/logging.config';

export interface RequestWithLogging extends Request {
  requestId: string;
  startTime: number;
  logger: CentralizedLogger;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  constructor(
    private readonly centralizedLogger: CentralizedLogger,
    private readonly auditLoggerService: AuditLoggerService,
    private readonly config: LoggingConfig,
  ) {}

  use(req: RequestWithLogging, res: Response, next: NextFunction): void {
    if (!this.config.enableLogging) {
      return next();
    }

    // Generate unique request ID and start time
    req.requestId = uuidv4();
    req.startTime = Date.now();
    
    // Create a child logger for this request
    req.logger = this.centralizedLogger.createChildLogger();

    // Extract user information from JWT token if available
    const user = (req as any).user;
    const userId = user?.id || user?.sub;
    const organizationId = user?.organizationId || user?.orgId;

    // Log request
    this.centralizedLogger.logRequest(
      req.method,
      req.originalUrl || req.url,
      req.requestId,
      userId,
      organizationId,
      req.body,
      req.query,
      req.params,
      req.headers
    );

    // Override res.end to capture response data
    const originalEnd = res.end;
    const chunks: Buffer[] = [];

    res.end = function(chunk?: any, encoding?: any) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }

      // Calculate duration
      const duration = Date.now() - req.startTime;

      // Get response body
      let responseBody: any;
      try {
        const responseData = Buffer.concat(chunks).toString();
        if (responseData) {
          responseBody = JSON.parse(responseData);
        }
      } catch (error) {
        // If parsing fails, use raw response
        responseBody = Buffer.concat(chunks).toString();
      }

      // Log response
      this.centralizedLogger.logResponse(
        req.method,
        req.originalUrl || req.url,
        req.requestId,
        res.statusCode,
        duration,
        userId,
        organizationId,
        responseBody
      );

      // Log audit event
      this.auditLoggerService.logAuditEvent({
        action: `${req.method} ${req.originalUrl || req.url}`,
        resourceType: 'API_ENDPOINT',
        resourceId: req.originalUrl || req.url,
        userId,
        organizationId,
        requestId: req.requestId,
        outcome: res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure',
        details: {
          method: req.method,
          route: req.originalUrl || req.url,
          statusCode: res.statusCode,
          duration,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        route: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration,
      });

      // Log performance if enabled
      if (this.config.enablePerformanceLogging) {
        this.centralizedLogger.logPerformance(
          `${req.method} ${req.originalUrl || req.url}`,
          duration,
          req.requestId,
          userId,
          organizationId,
          {
            statusCode: res.statusCode,
            contentLength: res.get('Content-Length'),
          }
        );
      }

      // Call original end method
      originalEnd.call(res, chunk, encoding);
    }.bind(this);

    next();
  }
}

// Factory function to create the middleware with dependencies
export function createLoggingMiddleware(
  centralizedLogger: CentralizedLogger,
  auditLoggerService: AuditLoggerService,
  config: LoggingConfig,
): LoggingMiddleware {
  return new LoggingMiddleware(centralizedLogger, auditLoggerService, config);
}
