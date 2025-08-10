/**
 * Wayfinder API Test Runner
 * Automated testing script for all public endpoints
 * Can be run in browser console or Node.js environment
 */

class WayfinderAPITester {
  constructor(baseUrl = 'https://wayfinder-api.vercel.app') {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1';
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Log test results with colors and formatting
   */
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };

    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
  }

  /**
   * Make HTTP request with error handling and timing
   */
  async makeRequest(method, endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const responseTime = Date.now() - startTime;
      const responseData = await this.parseResponse(response);

      const result = {
        method,
        endpoint,
        url,
        status: response.status,
        responseTime,
        success: response.ok,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      };

      this.results.push(result);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result = {
        method,
        endpoint,
        url,
        status: 0,
        responseTime,
        success: false,
        error: error.message,
        data: null
      };

      this.results.push(result);
      return result;
    }
  }

  /**
   * Parse response based on content type
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        return { error: 'Failed to parse JSON response' };
      }
    } else if (contentType && contentType.includes('text/html')) {
      return await response.text();
    } else {
      return await response.text();
    }
  }

  /**
   * Test public endpoints that don't require authentication
   */
  async testPublicEndpoints() {
    this.log('🏠 Testing Public Endpoints', 'info');

    // Test landing page
    const landingPage = await this.makeRequest('GET', '/');
    this.validateTest(
      'Landing page loads',
      landingPage.success && landingPage.status === 200,
      `Expected 200, got ${landingPage.status}`
    );

    // Test health check
    const health = await this.makeRequest('GET', '/health');
    this.validateTest(
      'Health check responds',
      health.success && health.status === 200,
      `Expected 200, got ${health.status}`
    );

    // Validate health check response structure
    if (health.success && health.data) {
      this.validateTest(
        'Health check has status field',
        health.data.status === 'ok',
        `Expected status: 'ok', got: ${health.data.status}`
      );

      this.validateTest(
        'Health check has timestamp',
        health.data.timestamp && typeof health.data.timestamp === 'string',
        'Health check should include timestamp'
      );
    }

    // Test API documentation
    const docs = await this.makeRequest('GET', `/${this.apiVersion}/docs`);
    this.validateTest(
      'API documentation accessible',
      docs.status === 200,
      `Expected 200, got ${docs.status}`
    );

    this.log('✅ Public endpoints testing complete', 'success');
  }

  /**
   * Test authentication behavior (without valid tokens)
   */
  async testAuthenticationBehavior() {
    this.log('🔐 Testing Authentication Behavior', 'info');

    // Test missing authentication
    const noAuth = await this.makeRequest('GET', `/${this.apiVersion}/trip`);
    this.validateTest(
      'Missing auth returns 401',
      noAuth.status === 401,
      `Expected 401, got ${noAuth.status}`
    );

    // Test invalid Firebase token
    const invalidToken = await this.makeRequest('GET', `/${this.apiVersion}/trip`, {
      headers: { 'Authorization': 'Bearer invalid-token-123' }
    });
    this.validateTest(
      'Invalid token returns 401',
      invalidToken.status === 401,
      `Expected 401, got ${invalidToken.status}`
    );

    // Test invalid API key
    const invalidApiKey = await this.makeRequest('GET', `/${this.apiVersion}/partner/pois`, {
      headers: { 'x-api-key': 'invalid-api-key-123' }
    });
    this.validateTest(
      'Invalid API key returns 401',
      invalidApiKey.status === 401,
      `Expected 401, got ${invalidApiKey.status}`
    );

    this.log('✅ Authentication testing complete', 'success');
  }

  /**
   * Test input validation with malformed requests
   */
  async testInputValidation() {
    this.log('⚠️ Testing Input Validation', 'info');

    // Test malformed JSON
    const malformedJson = await this.makeRequest('POST', `/${this.apiVersion}/trip`, {
      headers: { 'Authorization': 'Bearer fake-token' },
      body: '{ invalid json }'
    });
    this.validateTest(
      'Malformed JSON returns 400',
      malformedJson.status === 400 || malformedJson.status === 401,
      `Expected 400 or 401, got ${malformedJson.status}`
    );

    // Test empty request body
    const emptyBody = await this.makeRequest('POST', `/${this.apiVersion}/trip`, {
      headers: { 'Authorization': 'Bearer fake-token' },
      body: JSON.stringify({})
    });
    this.validateTest(
      'Empty body returns 400 or 401',
      emptyBody.status === 400 || emptyBody.status === 401,
      `Expected 400 or 401, got ${emptyBody.status}`
    );

    this.log('✅ Input validation testing complete', 'success');
  }

  /**
   * Test API performance characteristics
   */
  async testPerformance() {
    this.log('📊 Testing Performance', 'info');

    // Test multiple health checks for consistency
    const healthTests = [];
    for (let i = 0; i < 5; i++) {
      const result = await this.makeRequest('GET', '/health');
      healthTests.push(result);
    }

    const avgResponseTime = healthTests.reduce((sum, test) => sum + test.responseTime, 0) / healthTests.length;
    this.validateTest(
      'Average health check response time acceptable',
      avgResponseTime < 500,
      `Average response time: ${avgResponseTime.toFixed(2)}ms`
    );

    const allSuccessful = healthTests.every(test => test.success);
    this.validateTest(
      'All health checks successful',
      allSuccessful,
      'Some health checks failed'
    );

    this.log('✅ Performance testing complete', 'success');
  }

  /**
   * Test rate limiting behavior
   */
  async testRateLimiting() {
    this.log('🚦 Testing Rate Limiting', 'info');

    // Make multiple requests to test rate limiting headers
    const rateLimitTest = await this.makeRequest('GET', '/health');
    
    if (rateLimitTest.headers['x-ratelimit-limit']) {
      this.validateTest(
        'Rate limit headers present',
        rateLimitTest.headers['x-ratelimit-remaining'] !== undefined,
        'Rate limiting headers should be present'
      );
    } else {
      this.log('Rate limiting headers not found (may not be implemented for this endpoint)', 'warning');
    }

    this.log('✅ Rate limiting testing complete', 'success');
  }

  /**
   * Test error handling consistency
   */
  async testErrorHandling() {
    this.log('🚨 Testing Error Handling', 'info');

    // Test 404 for nonexistent endpoints
    const notFound = await this.makeRequest('GET', '/nonexistent-endpoint');
    this.validateTest(
      'Nonexistent endpoint returns 404',
      notFound.status === 404,
      `Expected 404, got ${notFound.status}`
    );

    // Test 405 for unsupported methods
    const methodNotAllowed = await this.makeRequest('PATCH', '/health');
    this.validateTest(
      'Unsupported method returns 405',
      methodNotAllowed.status === 405,
      `Expected 405, got ${methodNotAllowed.status}`
    );

    this.log('✅ Error handling testing complete', 'success');
  }

  /**
   * Validate test result and log appropriately
   */
  validateTest(testName, condition, details = '') {
    if (condition) {
      this.log(`✓ ${testName}`, 'success');
    } else {
      this.log(`✗ ${testName} - ${details}`, 'error');
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const totalTime = Date.now() - this.startTime;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;

    this.log('\n📋 TEST REPORT', 'info');
    this.log('═'.repeat(50), 'info');
    this.log(`Total Tests: ${totalTests}`, 'info');
    this.log(`Successful: ${successfulTests}`, successfulTests === totalTests ? 'success' : 'warning');
    this.log(`Failed: ${failedTests}`, failedTests === 0 ? 'success' : 'error');
    this.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`, 'info');
    this.log(`Total Time: ${totalTime}ms`, 'info');
    this.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`, 'info');

    // Endpoint performance summary
    this.log('\n📊 ENDPOINT PERFORMANCE', 'info');
    this.log('─'.repeat(50), 'info');
    
    const endpointStats = {};
    this.results.forEach(result => {
      if (!endpointStats[result.endpoint]) {
        endpointStats[result.endpoint] = {
          requests: 0,
          totalTime: 0,
          successes: 0
        };
      }
      endpointStats[result.endpoint].requests++;
      endpointStats[result.endpoint].totalTime += result.responseTime;
      if (result.success) endpointStats[result.endpoint].successes++;
    });

    Object.entries(endpointStats).forEach(([endpoint, stats]) => {
      const avgTime = (stats.totalTime / stats.requests).toFixed(2);
      const successRate = ((stats.successes / stats.requests) * 100).toFixed(1);
      this.log(`${endpoint}: ${avgTime}ms avg, ${successRate}% success`, 'info');
    });

    // Failed requests details
    const failures = this.results.filter(r => !r.success);
    if (failures.length > 0) {
      this.log('\n❌ FAILED REQUESTS', 'error');
      this.log('─'.repeat(50), 'error');
      failures.forEach(failure => {
        this.log(`${failure.method} ${failure.endpoint} - Status: ${failure.status}`, 'error');
        if (failure.error) {
          this.log(`   Error: ${failure.error}`, 'error');
        }
      });
    }

    return {
      totalTests,
      successfulTests,
      failedTests,
      successRate: (successfulTests / totalTests) * 100,
      totalTime,
      avgResponseTime,
      endpointStats,
      failures
    };
  }

  /**
   * Run complete test suite
   */
  async runAllTests() {
    this.log('🧭 Starting Wayfinder API Test Suite', 'info');
    this.log(`Testing: ${this.baseUrl}`, 'info');
    this.log('═'.repeat(50), 'info');

    try {
      await this.testPublicEndpoints();
      await this.testAuthenticationBehavior();
      await this.testInputValidation();
      await this.testPerformance();
      await this.testRateLimiting();
      await this.testErrorHandling();

      const report = this.generateReport();
      
      this.log('\n🎯 TEST SUITE COMPLETE', 'success');
      
      return report;

    } catch (error) {
      this.log(`\n💥 TEST SUITE FAILED: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Browser/Node.js compatibility
if (typeof window !== 'undefined') {
  // Browser environment
  window.WayfinderAPITester = WayfinderAPITester;
  
  // Auto-run if script is loaded directly
  if (document.readyState === 'complete') {
    console.log('🧭 Wayfinder API Tester loaded. Run: new WayfinderAPITester().runAllTests()');
  }
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = WayfinderAPITester;
  
  // Auto-run if script is executed directly
  if (require.main === module) {
    const tester = new WayfinderAPITester();
    tester.runAllTests().catch(console.error);
  }
}

/**
 * Usage Examples:
 * 
 * // Browser Console:
 * const tester = new WayfinderAPITester();
 * tester.runAllTests();
 * 
 * // Node.js:
 * const WayfinderAPITester = require('./api-test-runner.js');
 * const tester = new WayfinderAPITester();
 * tester.runAllTests();
 * 
 * // Custom base URL:
 * const tester = new WayfinderAPITester('http://localhost:3000');
 * tester.runAllTests();
 * 
 * // Individual test suites:
 * tester.testPublicEndpoints();
 * tester.testAuthenticationBehavior();
 * tester.testPerformance();
 */