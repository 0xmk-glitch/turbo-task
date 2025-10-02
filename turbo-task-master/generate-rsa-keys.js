const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create .env file with RSA keys
const envContent = `# JWT Configuration with RSA Keys
JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"
JWT_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=turbodb

# Logging Configuration
LOGGING_ENABLED=true
LOG_LEVEL=INFO
AUDIT_LOGGING_ENABLED=true
REQUEST_LOGGING_ENABLED=true
RESPONSE_LOGGING_ENABLED=true
PERFORMANCE_LOGGING_ENABLED=true
LOG_FORMAT=json
REDACT_SENSITIVE_FIELDS=password,token,authorization,apiKey,secret

# API Configuration
PORT=3000
NODE_ENV=development
`;

// Write .env file
const envPath = path.join(__dirname, 'apps', 'api', '.env');
fs.writeFileSync(envPath, envContent);

// Also save keys to separate files for reference
fs.writeFileSync(path.join(__dirname, 'private-key.pem'), privateKey);
fs.writeFileSync(path.join(__dirname, 'public-key.pem'), publicKey);

console.log('✅ RSA key pair generated successfully!');
console.log('📁 Files created:');
console.log('  - apps/api/.env (with RSA keys)');
console.log('  - private-key.pem (for reference)');
console.log('  - public-key.pem (for reference)');
console.log('\n🔐 RSA Key Details:');
console.log('  - Algorithm: RS256');
console.log('  - Key Size: 2048 bits');
console.log('  - Private Key: Used for signing tokens');
console.log('  - Public Key: Used for verifying tokens');
