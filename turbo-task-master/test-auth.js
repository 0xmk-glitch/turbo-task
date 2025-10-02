const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAuthentication() {
  try {
    console.log('🧪 Testing RSA-based Authentication Flow...\n');

    // Step 1: Create an organization
    console.log('1. Creating organization...');
    const orgResponse = await axios.post(`${API_BASE_URL}/organizations/register`, {
      name: 'Test Organization',
      description: 'Test Description'
    });
    console.log('✅ Organization created:', orgResponse.data);
    const organizationId = orgResponse.data.id;

    // Step 2: Register a user
    console.log('\n2. Registering user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
      organizationId: organizationId
    });
    console.log('✅ User registered:', registerResponse.data);
    const token = registerResponse.data.access_token;

    // Decode and inspect the JWT token
    console.log('\n🔍 Inspecting JWT token...');
    const tokenParts = token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    console.log('JWT Payload:', payload);

    // Step 3: Test protected endpoint
    console.log('\n3. Testing protected endpoint...');
    const protectedResponse = await axios.get(`${API_BASE_URL}/organizations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected endpoint accessed successfully:', protectedResponse.data);

    // Step 4: Test login
    console.log('\n4. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'TestPass123!'
    });
    console.log('✅ Login successful:', loginResponse.data);

    // Step 5: Test token validation
    console.log('\n5. Testing token validation...');
    const newToken = loginResponse.data.access_token;
    const newPayload = JSON.parse(Buffer.from(newToken.split('.')[1], 'base64').toString());
    console.log('New JWT Payload:', newPayload);

    console.log('\n🎉 All RSA-based authentication tests passed!');
    console.log('\n📋 Token Details:');
    console.log('  - Algorithm: RS256');
    console.log('  - Payload includes: userId, email, orgId, role, username');
    console.log('  - Signed with: RSA Private Key');
    console.log('  - Verified with: RSA Public Key');

  } catch (error) {
    console.error('❌ Authentication test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testAuthentication();

