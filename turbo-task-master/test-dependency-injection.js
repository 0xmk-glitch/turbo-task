const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./apps/api/src/app/app.module');

async function testDependencyInjection() {
  try {
    console.log('Testing dependency injection...');
    
    const app = await NestFactory.create(AppModule);
    
    // Test if AuditLoggerService can be resolved
    const auditLoggerService = app.get('AuditLoggerService');
    console.log('✅ AuditLoggerService resolved successfully');
    
    // Test if CentralizedLogger can be resolved
    const centralizedLogger = app.get('CentralizedLogger');
    console.log('✅ CentralizedLogger resolved successfully');
    
    // Test if LoggingService can be resolved
    const loggingService = app.get('LoggingService');
    console.log('✅ LoggingService resolved successfully');
    
    console.log('🎉 All dependencies resolved successfully!');
    
    await app.close();
  } catch (error) {
    console.error('❌ Dependency injection failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDependencyInjection();
