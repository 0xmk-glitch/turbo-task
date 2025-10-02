import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingService } from '../services/logging.service';
import { AuditLoggerService } from '../audit/audit-logger.service';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { CentralizedLogger } from '../utils/logger.util';
import { LoggingConfig, defaultLoggingConfig } from '../config/logging.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AuditLog]),
  ],
  providers: [
    LoggingService,
    AuditLoggerService,
    {
      provide: 'LOGGING_CONFIG',
      useValue: defaultLoggingConfig,
    },
    {
      provide: CentralizedLogger,
      useFactory: (config: LoggingConfig) => {
        return new CentralizedLogger(config);
      },
      inject: ['LOGGING_CONFIG'],
    },
  ],
  exports: [
    LoggingService,
    AuditLoggerService,
    CentralizedLogger,
  ],
})
export class LoggingModule {}
