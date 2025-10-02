const { execSync } = require('child_process');
const path = require('path');

// Change to the correct directory
process.chdir(path.join(__dirname, 'turbo-task-master'));

try {
  console.log('Running Jest tests for API...');
  execSync('npx jest apps/api/src --config=apps/api/jest.config.ts --verbose', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('All tests passed!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
}
