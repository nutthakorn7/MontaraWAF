#!/usr/bin/env node
/**
 * WAF Rule Test Script
 * Tests SQL Injection and XSS patterns against Coraza rules
 */

const testPatterns = {
  sql_injection: [
    // Test 1: Basic SQL injection
    { input: "1' OR '1'='1", shouldBlock: true, name: "Basic OR injection" },
    { input: "1; DROP TABLE users;--", shouldBlock: true, name: "Drop table" },
    { input: "1 UNION SELECT * FROM users", shouldBlock: true, name: "UNION select" },
    { input: "admin'--", shouldBlock: true, name: "Comment injection" },
    { input: "1' AND 1=1--", shouldBlock: true, name: "AND injection" },
    { input: "'; EXEC xp_cmdshell('dir');--", shouldBlock: true, name: "Command injection" },
    // Safe inputs
    { input: "normal search query", shouldBlock: false, name: "Normal search" },
    { input: "john@email.com", shouldBlock: false, name: "Email address" },
  ],
  xss: [
    // Test XSS patterns
    { input: "<script>alert(1)</script>", shouldBlock: true, name: "Script tag" },
    { input: "<img onerror=alert(1)>", shouldBlock: true, name: "IMG onerror" },
    { input: "javascript:alert(1)", shouldBlock: true, name: "JavaScript protocol" },
    { input: "<svg onload=alert(1)>", shouldBlock: true, name: "SVG onload" },
    { input: "<body onload=alert(1)>", shouldBlock: true, name: "Body onload" },
    { input: "'\"><script>alert(1)</script>", shouldBlock: true, name: "Quote escape XSS" },
    // Safe inputs
    { input: "Hello World", shouldBlock: false, name: "Normal text" },
    { input: "Product < 100", shouldBlock: false, name: "Less than sign" },
  ],
  path_traversal: [
    { input: "../../../etc/passwd", shouldBlock: true, name: "Path traversal" },
    { input: "..\\..\\windows\\system32", shouldBlock: true, name: "Windows traversal" },
    { input: "/etc/passwd", shouldBlock: true, name: "Absolute path" },
  ],
};

// Patterns from our Coraza rules
const sqlPatterns = [
  /\bunion\b.*\bselect\b/i,
  /\bselect\b.*\bfrom\b/i,
  /\binsert\b.*\binto\b/i,
  /\bupdate\b.*\bset\b/i,
  /\bdelete\b.*\bfrom\b/i,
  /'.*\bor\b.*='/i,
  /'.*\band\b.*='/i,
  /--\s*$/,
  /\bdrop\b.*\btable\b/i,
  /\bexec\b/i,
];

const xssPatterns = [
  /<script[^>]*>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /<img[^>]+onerror/i,
  /<svg[^>]+onload/i,
  /<body[^>]+onload/i,
  /<iframe[^>]*>/i,
];

const pathPatterns = [
  /\.\.\//,
  /\.\.\\/,
  /\/etc\/passwd/i,
  /\/windows\//i,
];

function testPattern(input, patterns) {
  for (const pattern of patterns) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

function runTests() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║              Montara WAF Rule Validation Tests                  ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  let totalTests = 0;
  let passed = 0;
  let failed = 0;

  // Test SQL Injection
  console.log("📌 SQL Injection Tests:");
  console.log("─".repeat(60));
  for (const test of testPatterns.sql_injection) {
    const blocked = testPattern(test.input, sqlPatterns);
    const success = blocked === test.shouldBlock;
    totalTests++;

    if (success) {
      passed++;
      console.log(`  ✅ ${test.name}: ${blocked ? "BLOCKED" : "ALLOWED"}`);
    } else {
      failed++;
      console.log(`  ❌ ${test.name}: Expected ${test.shouldBlock ? "BLOCK" : "ALLOW"}, got ${blocked ? "BLOCK" : "ALLOW"}`);
    }
  }

  console.log("\n📌 XSS Tests:");
  console.log("─".repeat(60));
  for (const test of testPatterns.xss) {
    const blocked = testPattern(test.input, xssPatterns);
    const success = blocked === test.shouldBlock;
    totalTests++;

    if (success) {
      passed++;
      console.log(`  ✅ ${test.name}: ${blocked ? "BLOCKED" : "ALLOWED"}`);
    } else {
      failed++;
      console.log(`  ❌ ${test.name}: Expected ${test.shouldBlock ? "BLOCK" : "ALLOW"}, got ${blocked ? "BLOCK" : "ALLOW"}`);
    }
  }

  console.log("\n📌 Path Traversal Tests:");
  console.log("─".repeat(60));
  for (const test of testPatterns.path_traversal) {
    const blocked = testPattern(test.input, pathPatterns);
    const success = blocked === test.shouldBlock;
    totalTests++;

    if (success) {
      passed++;
      console.log(`  ✅ ${test.name}: ${blocked ? "BLOCKED" : "ALLOWED"}`);
    } else {
      failed++;
      console.log(`  ❌ ${test.name}: Expected ${test.shouldBlock ? "BLOCK" : "ALLOW"}, got ${blocked ? "BLOCK" : "ALLOW"}`);
    }
  }

  // Summary
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║                         Test Summary                            ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Success Rate: ${((passed / totalTests) * 100).toFixed(1)}%`);
  console.log("");

  if (failed === 0) {
    console.log("🎉 All WAF rules are working correctly!\n");
  } else {
    console.log("⚠️  Some rules need attention.\n");
  }

  return failed === 0;
}

runTests();
