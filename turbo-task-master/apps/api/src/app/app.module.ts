import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Task } from './tasks/entities/task.entity';
import { TasksModule } from './tasks/tasks.module';
import path = require('path');
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Organization } from './organizations/entities/organization.entity';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuditLog } from './audit/entities/audit-log.entity';
import { AuditModule } from './audit/audit.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "turbodb",
      entities: [Task, User, Organization, AuditLog],
      synchronize: false,
      dropSchema: false, // This will recreate the database schema
      logger: 'advanced-console',
      logging: ['query', 'error', 'warn']
    }),
    TasksModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
    AuditModule,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
