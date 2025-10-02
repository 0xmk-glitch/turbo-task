# Environment Configuration for Logging

Add these environment variables to your `.env` file or set them in your deployment environment:

## Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=turbodb
```

## JWT Configuration (RSA Key Pairs)
```env
# RSA Private Key for signing tokens (keep this secret!)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"

# RSA Public Key for verifying tokens (can be shared)
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"

# Token expiration (optional, defaults to 24h)
JWT_EXPIRES_IN=24h
```

### Generate RSA Keys
Run the key generation script:
```bash
node generate-rsa-keys.js
```

This will create:
- `apps/api/.env` with the RSA keys
- `private-key.pem` and `public-key.pem` for reference

## Logging Configuration
```env
# Enable/disable logging
LOGGING_ENABLED=true

# Log level: DEBUG, INFO, ERROR (case insensitive)
LOG_LEVEL=INFO

# Enable specific logging types
AUDIT_LOGGING_ENABLED=true
REQUEST_LOGGING_ENABLED=true
RESPONSE_LOGGING_ENABLED=true
PERFORMANCE_LOGGING_ENABLED=true

# Log format: json, pretty
LOG_FORMAT=json

# Comma-separated list of fields to redact
REDACT_SENSITIVE_FIELDS=password,token,authorization,apiKey,secret

# Log file names (optional)
AUDIT_LOG_FILE=audit.log
REQUEST_LOG_FILE=requests.log
```

## API Configuration
```env
PORT=3000
NODE_ENV=development
```

## Example Configuration Values

### Development Environment
```env
LOGGING_ENABLED=true
LOG_LEVEL=DEBUG
AUDIT_LOGGING_ENABLED=true
REQUEST_LOGGING_ENABLED=true
RESPONSE_LOGGING_ENABLED=true
PERFORMANCE_LOGGING_ENABLED=true
LOG_FORMAT=pretty
```

### Production Environment
```env
LOGGING_ENABLED=true
LOG_LEVEL=INFO
AUDIT_LOGGING_ENABLED=true
REQUEST_LOGGING_ENABLED=false
RESPONSE_LOGGING_ENABLED=false
PERFORMANCE_LOGGING_ENABLED=true
LOG_FORMAT=json
```

### Disable Logging
```env
LOGGING_ENABLED=false
```
