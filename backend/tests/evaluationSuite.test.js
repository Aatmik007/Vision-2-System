import assert from 'assert';
import { EVALUATION_DATASET } from '../src/evaluation/evaluationDataset.js';
import { evaluateSemanticCorrectness } from '../src/evaluation/semanticEvaluator.js';
import { compareArchitectureVersions } from '../src/evaluation/versionComparator.js';
import { runEvaluationSuite, getLatestEvaluationResults } from '../src/evaluation/evaluationRunner.js';

async function runTests() {
  console.log('--- RUNNING AI QUALITY EVALUATION SUITE TESTS ---');

  // Test 1: Evaluation Dataset Integrity
  console.log('Test 1: Evaluation Dataset Integrity');
  assert.ok(Array.isArray(EVALUATION_DATASET), 'Dataset must be an array');
  assert.ok(EVALUATION_DATASET.length >= 8, 'Dataset must contain at least 8 test cases');

  const domains = new Set(EVALUATION_DATASET.map(tc => tc.domain));
  assert.ok(domains.has('Food Delivery'), 'Must include Food Delivery domain');
  assert.ok(domains.has('E-Commerce'), 'Must include E-Commerce domain');
  assert.ok(domains.has('Task Management'), 'Must include Task Management domain');
  assert.ok(domains.has('Booking & Healthcare'), 'Must include Booking & Healthcare domain');
  console.log(`✓ Passed Test 1: Dataset contains ${EVALUATION_DATASET.length} diverse cases across ${domains.size} domains`);

  // Test 2: Semantic Evaluator Functionality
  console.log('Test 2: Semantic Evaluator Functionality');
  const sampleFoodBlueprint = {
    entities: [
      { name: 'User', fields: [] },
      { name: 'Restaurant', fields: [] },
      { name: 'MenuItem', fields: [] },
      { name: 'Order', fields: [] }
    ],
    apiEndpoints: [
      { method: 'GET', endpoint: '/api/v1/restaurants', authentication: 'Public' },
      { method: 'POST', endpoint: '/api/v1/orders', authentication: 'Required (Bearer JWT)' }
    ],
    architecture: { pattern: 'Microservices with Socket.io' },
    techStack: [{ category: 'Realtime', technology: 'Socket.io' }]
  };

  const foodTestCase = EVALUATION_DATASET.find(tc => tc.id === 'eval-food-delivery');
  const evalResult = evaluateSemanticCorrectness(sampleFoodBlueprint, foodTestCase);

  assert.ok(evalResult.semanticScore >= 80, `Expected high semantic score, got ${evalResult.semanticScore}`);
  assert.strictEqual(evalResult.domainRelevance, 'High');
  assert.ok(evalResult.criteria.entityCoverage.passed, 'Entity coverage should pass');
  assert.ok(evalResult.criteria.authSecurity.passed, 'Auth security should pass');
  console.log(`✓ Passed Test 2: Semantic score computed accurately (${evalResult.semanticScore}%)`);

  // Test 3: Version Comparator Diff Engine
  console.log('Test 3: Version Comparator Diff Engine');
  const v1 = {
    entities: [{ name: 'User', fields: [{ name: '_id' }] }],
    apiEndpoints: [{ method: 'GET', endpoint: '/api/users', authentication: 'Public' }],
    modules: [{ name: 'Auth' }]
  };
  const v2 = {
    entities: [
      { name: 'User', fields: [{ name: '_id' }, { name: 'email' }] },
      { name: 'AuditLog', fields: [{ name: '_id' }] }
    ],
    apiEndpoints: [
      { method: 'GET', endpoint: '/api/users', authentication: 'Required (JWT)' },
      { method: 'POST', endpoint: '/api/users/logout', authentication: 'Required (JWT)' }
    ],
    modules: [{ name: 'Auth' }, { name: 'AuditModule' }]
  };

  const diff = compareArchitectureVersions(v1, v2);
  assert.strictEqual(diff.hasChanges, true);
  assert.ok(diff.entities.added.includes('AuditLog'), 'AuditLog must be in added entities');
  assert.strictEqual(diff.entities.modified.length, 1, 'User entity should be flagged modified');
  assert.ok(diff.apiEndpoints.added.includes('POST /api/users/logout'), 'New endpoint must be detected');
  assert.strictEqual(diff.apiEndpoints.modified.length, 1, 'Auth change on GET /api/users must be detected');
  assert.ok(diff.modules.added.includes('AuditModule'), 'New module must be detected');
  console.log(`✓ Passed Test 3: Version comparator detected ${diff.totalDiffs} precise architectural modifications`);

  // Test 4: End-to-End Evaluation Runner (Full Dataset Execution)
  console.log('Test 4: End-to-End Evaluation Runner (Full Dataset Execution)');
  const report = await runEvaluationSuite({ useLiveApi: false });

  assert.ok(report, 'Report must be returned');
  assert.strictEqual(report.metrics.totalPromptsTested, EVALUATION_DATASET.length);
  assert.ok(report.metrics.schemaValidationSuccessRate >= 95, `Schema validation rate should be >=95%, got ${report.metrics.schemaValidationSuccessRate}%`);
  assert.ok(report.metrics.latency.averageMs > 0, 'Average latency must be positive number');
  assert.ok(report.metrics.latency.minMs > 0, 'Min latency must be positive');
  assert.ok(report.metrics.latency.maxMs >= report.metrics.latency.minMs, 'Max latency must be >= min');

  // Verify token usage transparency (Requirement 5)
  assert.strictEqual(report.metrics.tokenUsage.reliableUsageAvailable, false);
  assert.ok(report.metrics.tokenUsage.disclaimer.includes('Deterministic Mock'), 'Must disclose mock execution');

  // Verify domain breakdown
  assert.ok(Array.isArray(report.domainBreakdown), 'Domain breakdown must be an array');
  assert.ok(report.domainBreakdown.length >= 4, 'Must have at least 4 domain breakdown entries');

  // Verify test results details
  assert.strictEqual(report.testResults.length, EVALUATION_DATASET.length);
  report.testResults.forEach(res => {
    assert.ok(res.testId, 'Result must have testId');
    assert.ok(res.domain, 'Result must have domain');
    assert.ok(typeof res.latencyMs === 'number', 'Latency must be number');
    assert.ok(res.structuralValidation, 'Must have structural validation result');
  });

  console.log(`✓ Passed Test 4: Evaluation suite evaluated ${report.metrics.totalPromptsTested} cases (Schema Success: ${report.metrics.schemaValidationSuccessRate}%, Avg Latency: ${report.metrics.latency.averageMs}ms)`);

  // Test 5: Cache Retrieval
  console.log('Test 5: Cache Retrieval');
  const cachedReport = await getLatestEvaluationResults();
  assert.ok(cachedReport, 'Cached report must be returned');
  assert.strictEqual(cachedReport.metrics.totalPromptsTested, report.metrics.totalPromptsTested);
  console.log('✓ Passed Test 5: Results retrieved cleanly from cache');

  console.log('=== ALL AI QUALITY EVALUATION SUITE TESTS PASSED! ===');
}

runTests().catch(err => {
  console.error('Evaluation suite test failed:', err);
  process.exit(1);
});
