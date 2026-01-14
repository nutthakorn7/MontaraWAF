#!/usr/bin/env node
/**
 * API Endpoint Test Script
 * Tests all API endpoints against the Next.js dev server
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

const endpoints = [
  // Health & Dashboard
  { method: 'GET', path: '/api/v1/health', name: 'Health Check' },
  { method: 'GET', path: '/api/v1/dashboard', name: 'Dashboard' },
  { method: 'GET', path: '/api/v1/security-dashboard', name: 'Security Dashboard' },
  { method: 'GET', path: '/api/v1/attack-analytics', name: 'Attack Analytics' },
  { method: 'GET', path: '/api/v1/country-events', name: 'Country Events' },
  
  // Policies
  { method: 'GET', path: '/api/v1/policies', name: 'List Policies' },
  
  // WAF
  { method: 'GET', path: '/api/v1/waf/stats', name: 'WAF Stats' },
  { method: 'GET', path: '/api/v1/waf/policies', name: 'WAF Policies' },
  { method: 'GET', path: '/api/v1/waf/ips', name: 'WAF IPs' },
  { method: 'GET', path: '/api/v1/waf/geo', name: 'WAF Geo' },
  { method: 'GET', path: '/api/v1/waf/ssl', name: 'WAF SSL' },
  { method: 'GET', path: '/api/v1/waf/decisions', name: 'WAF Decisions' },
  
  // CDN
  { method: 'GET', path: '/api/v1/cdn/stats', name: 'CDN Stats' },
  
  // Edge
  { method: 'GET', path: '/api/v1/edge/ddos', name: 'DDoS Stats' },
  { method: 'GET', path: '/api/v1/edge/caching-rules', name: 'Caching Rules' },
  { method: 'GET', path: '/api/v1/edge/dns', name: 'DNS Records' },
  { method: 'GET', path: '/api/v1/edge/ip-rules', name: 'IP Rules' },
  { method: 'GET', path: '/api/v1/edge/bot/stats', name: 'Bot Stats' },
  { method: 'GET', path: '/api/v1/edge/bot/settings', name: 'Bot Settings' },
  
  // Analytics
  { method: 'GET', path: '/api/v1/analytics/stories', name: 'Attack Stories' },
  { method: 'GET', path: '/api/v1/analytics/reports', name: 'Reports' },
  
  // Auth
  { method: 'POST', path: '/api/v1/auth/login', name: 'Auth Login', body: { email: 'admin@montara.io', password: 'admin123' } },
  { method: 'POST', path: '/api/v1/auth/logout', name: 'Auth Logout' },
  { method: 'POST', path: '/api/v1/auth/register', name: 'Auth Register', body: { email: 'test@test.com', password: 'test123', name: 'Test' } },
  { method: 'POST', path: '/api/v1/auth/refresh', name: 'Auth Refresh' },
];

async function testEndpoint(endpoint) {
  try {
    const options = {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint.path}`, options);
    const status = response.status;
    
    // Consider 2xx and 4xx as "working" (endpoint responds)
    const isWorking = status >= 200 && status < 500;
    
    return {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      status,
      working: isWorking,
      error: null,
    };
  } catch (error) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      status: 0,
      working: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║              Montara WAF API Endpoint Tests                     ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
  console.log(`Testing against: ${BASE_URL}\n`);

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    if (result.working) {
      passed++;
      console.log(`  ✅ ${result.method.padEnd(6)} ${result.path.padEnd(35)} ${result.status}`);
    } else {
      failed++;
      console.log(`  ❌ ${result.method.padEnd(6)} ${result.path.padEnd(35)} ${result.error || result.status}`);
    }
  }

  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                         Test Summary                            ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log(`  Total Endpoints: ${endpoints.length}`);
  console.log(`  ✅ Working: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);
  console.log("");

  if (failed === 0) {
    console.log("🎉 All API endpoints are working!\n");
  } else {
    console.log("⚠️  Some endpoints need attention.\n");
    console.log("Make sure the Next.js dev server is running: npm run dev\n");
  }

  return failed === 0;
}

runTests();
