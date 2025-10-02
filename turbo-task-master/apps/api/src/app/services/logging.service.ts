import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CentralizedLogger, LogLevel } from '../utils/logger.util';
import { LoggingConfig, defaultLoggingConfig } from '../config/logging.config';

@Injectable()
export class LoggingService implements OnModuleInit {
  private centralizedLogger: CentralizedLogger;
  private config: LoggingConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.loadConfig();
    this.centralizedLogger = new CentralizedLogger(this.config);
  }

  onModuleInit() {
    this.info('LoggingService initialized', {
      config: {
        enableLogging: this.config.enableLogging,
        logLevel: this.config.logLevel,
        enableAuditLogging: this.config.enableAuditLogging,
        enableRequestLogging: this.config.enableRequestLogging,
        enableResponseLogging: this.config.enableResponseLogging,
        enablePerformanceLogging: this.config.enablePerformanceLogging,
      }
    });
  }

  private loadConfig(): LoggingConfig {
    const logLevelString = this.configService.get<string>('LOG_LEVEL', 'INFO');
    let logLevel: LogLevel;
    
    switch (logLevelString.toUpperCase()) {
      case 'DEBUG':
        logLevel = LogLevel.DEBUG;
        break;
      case 'INFO':
        logLevel = LogLevel.INFO;
        break;
      case 'ERROR':
        logLevel = LogLevel.ERROR;
        break;
      default:
        logLevel = LogLevel.INFO;
    }

    return {
      enableLogging: this.configService.get<boolean>('LOGGING_ENABLED', defaultLoggingConfig.enableLogging),
      logLevel,
      enableAuditLogging: this.configService.get<boolean>('AUDIT_LOGGING_ENABLED', defaultLoggingConfig.enableAuditLogging),
      enableRequestLogging: this.configService.get<boolean>('REQUEST_LOGGING_ENABLED', defaultLoggingConfig.enableRequestLogging),
      enableResponseLogging: this.configService.get<boolean>('RESPONSE_LOGGING_ENABLED', defaultLoggingConfig.enableResponseLogging),
      enablePerformanceLogging: this.configService.get<boolean>('PERFORMANCE_LOGGING_ENABLED', defaultLoggingConfig.enablePerformanceLogging),
      redactSensitiveFields: this.configService.get<string>('REDACT_SENSITIVE_FIELDS', 'password,token,authorization,apiKey,secret').split(','),
      logFormat: this.configService.get<'json' | 'pretty'>('LOG_FORMAT', defaultLoggingConfig.logFormat),
      auditLogFile: this.configService.get<string>('AUDIT_LOG_FILE', defaultLoggingConfig.auditLogFile),
      requestLogFile: this.configService.get<string>('REQUEST_LOG_FILE', defaultLoggingConfig.requestLogFile),
    };
  }

  getLogger(): CentralizedLogger {
    return this.centralizedLogger;
  }

  getConfig(): LoggingConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.centralizedLogger = new CentralizedLogger(this.config);
    
    this.info('Logging configuration updated', { newConfig });
  }

  // Convenience methods
  debug(message: string, metadata?: Record<string, any>): void {
    this.centralizedLogger.debug(message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.centralizedLogger.info(message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.centralizedLogger.error(message, error, metadata);
  }

  // Create a child logger for specific operations
  createChildLogger(): CentralizedLogger {
    return this.centralizedLogger.createChildLogger();
  }

  // Performance logging method
  logPerformance(
    operation: string,
    duration: number,
    requestId?: string,
    userId?: string,
    organizationId?: string,
    metadata?: Record<string, any>
  ): void {
    this.centralizedLogger.logPerformance(
      operation,
      duration,
      requestId,
      userId,
      organizationId,
      metadata
    );
  }
}
