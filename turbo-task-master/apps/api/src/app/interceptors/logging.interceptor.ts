import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';
import { AuditLoggerService } from '../audit/audit-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    private readonly loggingService: LoggingService,
    private readonly auditLoggerService: AuditLoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    const requestId = request.requestId || 'unknown';
    const userId = request.user?.id || request.user?.sub;
    const organizationId = request.user?.organizationId || request.user?.orgId;

    const startTime = Date.now();

    // Log method entry
    this.loggingService.debug('Method execution started', {
      requestId,
      className,
      methodName,
      userId,
      organizationId,
      route: request.originalUrl || request.url,
      method: request.method,
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        
        // Log successful method execution
        this.loggingService.debug('Method execution completed', {
          requestId,
          className,
          methodName,
          userId,
          organizationId,
          duration,
          success: true,
        });

        // Log performance if duration is significant
        if (duration > 1000) { // Log if execution takes more than 1 second
          this.loggingService.logPerformance(
            `${className}.${methodName}`,
            duration,
            requestId,
            userId,
            organizationId,
            {
              route: request.originalUrl || request.url,
              method: request.method,
            }
          );
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Log method execution error
        this.loggingService.error('Method execution failed', error, {
          requestId,
          className,
          methodName,
          userId,
          organizationId,
          duration,
          success: false,
          route: request.originalUrl || request.url,
          method: request.method,
        });

        // Log audit event for error
        this.auditLoggerService.logAuditEvent({
          action: `${className}.${methodName}`,
          resourceType: 'API_ENDPOINT',
          resourceId: request.originalUrl || request.url,
          userId,
          organizationId,
          requestId,
          outcome: 'failure',
          details: {
            error: error.message,
            className,
            methodName,
            duration,
            route: request.originalUrl || request.url,
            method: request.method,
          },
          ipAddress: request.ip || request.connection.remoteAddress,
          userAgent: request.get('User-Agent'),
          method: request.method,
          route: request.originalUrl || request.url,
          statusCode: error.status || 500,
          duration,
        });

        return throwError(() => error);
      }),
    );
  }
}
