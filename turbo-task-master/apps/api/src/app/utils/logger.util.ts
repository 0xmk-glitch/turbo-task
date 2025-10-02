import { LoggingConfig } from '../config/logging.config';
import { v4 as uuidv4 } from 'uuid';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId: string;
  service: string;
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  organizationId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class CentralizedLogger {
  private config: LoggingConfig;
  private correlationId: string;

  constructor(config: LoggingConfig) {
    this.config = config;
    this.correlationId = uuidv4();
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableLogging) return false;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.ERROR];
    const configLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= configLevelIndex;
  }

  private redactSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.redactSensitiveData(item));
    }
    
    const redacted = { ...data };
    
    for (const field of this.config.redactSensitiveFields) {
      if (redacted[field]) {
        redacted[field] = '[REDACTED]';
      }
    }
    
    // Recursively redact nested objects
    for (const key in redacted) {
      if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redactSensitiveData(redacted[key]);
      }
    }
    
    return redacted;
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.config.logFormat === 'pretty') {
      return this.formatPrettyLog(entry);
    }
    return JSON.stringify(entry);
  }

  private formatPrettyLog(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.padEnd(5);
    const correlation = entry.correlationId.substring(0, 8);
    
    let log = `[${timestamp}] ${level} [${correlation}] ${entry.message}`;
    
    if (entry.route) {
      log += ` | ${entry.method} ${entry.route}`;
    }
    
    if (entry.statusCode) {
      log += ` | ${entry.statusCode}`;
    }
    
    if (entry.duration) {
      log += ` | ${entry.duration}ms`;
    }
    
    if (entry.userId) {
      log += ` | user:${entry.userId}`;
    }
    
    if (entry.organizationId) {
      log += ` | org:${entry.organizationId}`;
    }
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      log += ` | ${JSON.stringify(entry.metadata)}`;
    }
    
    if (entry.error) {
      log += ` | ERROR: ${entry.error.message}`;
    }
    
    return log;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      correlationId: this.correlationId,
      service: 'turbo-task-api',
      message,
      metadata: metadata ? this.redactSensitiveData(metadata) : undefined,
    };

    const formattedLog = this.formatLogEntry(entry);
    console.log(formattedLog);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const errorMetadata = {
      ...metadata,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    
    this.log(LogLevel.ERROR, message, errorMetadata);
  }

  // API-specific logging methods
  logRequest(
    method: string,
    route: string,
    requestId: string,
    userId?: string,
    organizationId?: string,
    body?: any,
    query?: any,
    params?: any,
    headers?: any
  ): void {
    if (!this.config.enableRequestLogging) return;

    this.info('API Request', {
      requestId,
      method,
      route,
      userId,
      organizationId,
      body: this.redactSensitiveData(body),
      query: this.redactSensitiveData(query),
      params: this.redactSensitiveData(params),
      headers: this.redactSensitiveData(headers),
    });
  }

  logResponse(
    method: string,
    route: string,
    requestId: string,
    statusCode: number,
    duration: number,
    userId?: string,
    organizationId?: string,
    responseBody?: any
  ): void {
    if (!this.config.enableResponseLogging) return;

    this.info('API Response', {
      requestId,
      method,
      route,
      statusCode,
      duration,
      userId,
      organizationId,
      responseBody: this.redactSensitiveData(responseBody),
    });
  }

  logAudit(
    action: string,
    resource: string,
    userId?: string,
    organizationId?: string,
    requestId?: string,
    outcome: 'success' | 'failure' = 'success',
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enableAuditLogging) return;

    this.info('Audit Log', {
      action,
      resource,
      userId,
      organizationId,
      requestId,
      outcome,
      metadata: this.redactSensitiveData(metadata),
    });
  }

  logPerformance(
    operation: string,
    duration: number,
    requestId?: string,
    userId?: string,
    organizationId?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enablePerformanceLogging) return;

    this.info('Performance Log', {
      operation,
      duration,
      requestId,
      userId,
      organizationId,
      metadata: this.redactSensitiveData(metadata),
    });
  }

  // Create a new logger instance with a new correlation ID
  createChildLogger(): CentralizedLogger {
    const childLogger = new CentralizedLogger(this.config);
    childLogger.correlationId = uuidv4();
    return childLogger;
  }

  // Get current correlation ID
  getCorrelationId(): string {
    return this.correlationId;
  }
}
