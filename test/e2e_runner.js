#!/usr/bin/env node
/**
 * e2e_runner.js
 * Master E2E Test Runner for Sandooq El-Amara Landing Page (sandooq-landing)
 * Pure Node.js - Zero external runtime dependencies
 * 
 * Usage:
 *   node sandooq-landing/test/e2e_runner.js
 *   node sandooq-landing/test/e2e_runner.js --tier=1
 *   node sandooq-landing/test/e2e_runner.js --feature=r2
 *   node sandooq-landing/test/e2e_runner.js --verbose
 */

const path = require('path');
const fs = require('fs');

// Load test suites
const tier1 = require('./tier1_feature_coverage.test.js');
const tier2 = require('./tier2_boundaries_corners.test.js');
const tier3 = require('./tier3_cross_feature.test.js');
const tier4 = require('./tier4_real_world_scenarios.test.js');

const allTests = [
  ...tier1.tests,
  ...tier2.tests,
  ...tier3.tests,
  ...tier4.tests
];

// Parse CLI arguments
const args = process.argv.slice(2);
let tierFilter = null;
let featureFilter = null;
let verbose = false;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    const val = arg.split('=')[1];
    if (val !== 'all') tierFilter = parseInt(val, 10);
  } else if (arg.startsWith('--feature=')) {
    featureFilter = arg.split('=')[1].toUpperCase();
  } else if (arg === '--verbose' || arg === '-v') {
    verbose = true;
  }
}

// Filter tests
let testsToRun = allTests;
if (tierFilter !== null && !isNaN(tierFilter)) {
  testsToRun = testsToRun.filter(t => t.tier === tierFilter);
}
if (featureFilter !== null && featureFilter !== 'ALL') {
  testsToRun = testsToRun.filter(t => t.requirement.toUpperCase().includes(featureFilter));
}

// Execution tracking
const results = {
  total: testsToRun.length,
  passed: 0,
  failed: 0,
  details: [],
  byTier: { 1: { pass: 0, fail: 0 }, 2: { pass: 0, fail: 0 }, 3: { pass: 0, fail: 0 }, 4: { pass: 0, fail: 0 } },
  byRequirement: {}
};

console.log('='.repeat(78));
console.log('  Sandooq El-Amara Landing Page (sandooq-landing) — E2E Test Runner');
console.log('  Mode: Opaque-Box Requirement-Driven | Pure Node.js (Zero Dependencies)');
console.log('='.repeat(78));
console.log(`Discovered: ${allTests.length} total registered tests across Tiers 1-4.`);
console.log(`Executing:  ${testsToRun.length} selected tests for this run.\n`);

const startTime = process.hrtime();

for (const test of testsToRun) {
  const req = test.requirement;
  if (!results.byRequirement[req]) {
    results.byRequirement[req] = { pass: 0, fail: 0 };
  }

  const t0 = process.hrtime();
  let pass = false;
  let errorMsg = null;

  try {
    test.fn();
    pass = true;
    results.passed++;
    results.byTier[test.tier].pass++;
    results.byRequirement[req].pass++;
  } catch (err) {
    pass = false;
    results.failed++;
    results.byTier[test.tier].fail++;
    results.byRequirement[req].fail++;
    errorMsg = err.message || err.toString();
  }

  const diff = process.hrtime(t0);
  const durationMs = ((diff[0] * 1000) + (diff[1] / 1e6)).toFixed(2);

  results.details.push({
    id: test.id,
    name: test.name,
    tier: test.tier,
    req: test.requirement,
    pass,
    durationMs,
    errorMsg
  });

  const statusLabel = pass ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`  ${statusLabel} [Tier ${test.tier}] [${test.id}] ${test.name} (${durationMs}ms)`);
  if (!pass && (verbose || true)) {
    console.log(`         \x1b[33mReason: ${errorMsg}\x1b[0m`);
  }
}

const totalDiff = process.hrtime(startTime);
const totalDurationMs = ((totalDiff[0] * 1000) + (totalDiff[1] / 1e6)).toFixed(2);
const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0.0';

console.log('\n' + '='.repeat(78));
console.log('  E2E TEST EXECUTION SUMMARY REPORT');
console.log('='.repeat(78));
console.log(`  Total Tests Executed: ${results.total}`);
console.log(`  Passed:               \x1b[32m${results.passed}\x1b[0m`);
console.log(`  Failed:               \x1b[31m${results.failed}\x1b[0m`);
console.log(`  Overall Pass Rate:    ${passRate}%`);
console.log(`  Execution Time:       ${totalDurationMs} ms`);

console.log('\n--- Coverage By Tier ---');
for (const t of [1, 2, 3, 4]) {
  const data = results.byTier[t];
  const count = data.pass + data.fail;
  const rate = count > 0 ? ((data.pass / count) * 100).toFixed(1) : '0.0';
  console.log(`  Tier ${t}: ${data.pass}/${count} passed (${rate}%)`);
}

console.log('\n--- Coverage By Requirement ---');
for (const [req, data] of Object.entries(results.byRequirement)) {
  const count = data.pass + data.fail;
  const rate = count > 0 ? ((data.pass / count) * 100).toFixed(1) : '0.0';
  console.log(`  ${req.padEnd(10)}: ${data.pass}/${count} passed (${rate}%)`);
}
console.log('='.repeat(78) + '\n');

// Exit code convention: 0 if all tests pass, 1 if any failure
if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
