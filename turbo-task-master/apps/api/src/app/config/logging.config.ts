import { LogLevel } from '../utils/logger.util';

export interface LoggingConfig {
  enableLogging: boolean;
  logLevel: LogLevel;
  enableAuditLogging: boolean;
  enableRequestLogging: boolean;
  enableResponseLogging: boolean;
  enablePerformanceLogging: boolean;
  redactSensitiveFields: string[];
  logFormat: 'json' | 'pretty';
  auditLogFile?: string;
  requestLogFile?: string;
}

export const defaultLoggingConfig: LoggingConfig = {
  enableLogging: true,
  logLevel: LogLevel.INFO,
  enableAuditLogging: true,
  enableRequestLogging: true,
  enableResponseLogging: true,
  enablePerformanceLogging: true,
  redactSensitiveFields: ['password', 'token', 'authorization', 'apiKey', 'secret'],
  logFormat: 'json',
  auditLogFile: 'audit.log',
  requestLogFile: 'requests.log',
};
