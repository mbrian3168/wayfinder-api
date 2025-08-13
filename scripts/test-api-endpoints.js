#!/usr/bin/env node

/**
 * API Endpoint Testing Script
 * Tests the Wayfinder API endpoints and validates responses
 */

const http = require('http');
const https = require('https');

console.log('🧪 API Endpoint Testing\n');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const TIMEOUT = 5000;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TIMEOUT
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function testEndpoint(name, url, expectedStatus = 200, options = {}) {
  return async () => {
    try {
      console.log(`Testing: ${name}`);
      const response = await makeRequest(url, options);
      
      if (response.statusCode === expectedStatus) {
        console.log(`   ✅ ${name} - Status: ${response.statusCode}`);
        results.passed++;
        results.tests.push({ name, status: 'PASSED', statusCode: response.statusCode });
        return true;
      } else {
        console.log(`   ❌ ${name} - Expected: ${expectedStatus}, Got: ${response.statusCode}`);
        results.failed++;
        results.tests.push({ name, status: 'FAILED', statusCode: response.statusCode, expected: expectedStatus });
        return false;
      }
    } catch (error) {
      console.log(`   ❌ ${name} - Error: ${error.message}`);
      results.failed++;
      results.tests.push({ name, status: 'ERROR', error: error.message });
      return false;
    }
  };
}

async function runTests() {
  console.log(`Testing API at: ${BASE_URL}\n`);

  // Test 1: Health endpoint
  await testEndpoint(
    'Health Check',
    `${BASE_URL}/v1/health`,
    200
  )();

  // Test 2: Status endpoint
  await testEndpoint(
    'Status Check',
    `${BASE_URL}/v1/status`,
    200
  )();

  // Test 3: API index
  await testEndpoint(
    'API Index',
    `${BASE_URL}/v1`,
    200
  )();

  // Test 4: Documentation endpoint
  await testEndpoint(
    'API Documentation',
    `${BASE_URL}/v1/docs`,
    200
  )();

  // Test 5: OpenAPI spec
  await testEndpoint(
    'OpenAPI Specification',
    `${BASE_URL}/v1/openapi.yaml`,
    200
  )();

  // Test 6: Protected endpoint without auth (should fail)
  await testEndpoint(
    'Protected Endpoint (No Auth)',
    `${BASE_URL}/v1/trip/start`,
    401,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { test: 'data' }
    }
  )();

  // Test 7: Invalid endpoint (should return 404)
  await testEndpoint(
    'Invalid Endpoint',
    `${BASE_URL}/v1/invalid-endpoint`,
    404
  )();

  // Test 8: Root endpoint
  await testEndpoint(
    'Root Endpoint',
    `${BASE_URL}/`,
    200
  )();

  // Print summary
  console.log('\n📊 Test Summary');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  results.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`   ${status} ${test.name} - ${test.status} (${test.statusCode || test.error})`);
  });

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! The API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the API configuration and environment.');
  }

  return results.failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest };