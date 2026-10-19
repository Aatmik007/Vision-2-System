import assert from 'node:assert';

/**
 * Mock consistency finding classifier matching backend rules for frontend integration testing
 */
export const classifyFindingSeverity = (findingType) => {
  switch (findingType) {
    case 'DUPLICATE_ENDPOINT':
    case 'INVALID_METHOD':
    case 'UNDEFINED_MODEL':
    case 'ORPHAN_CONNECTION':
    case 'EMPTY_SCHEMA':
      return 'error';
    case 'UNPROTECTED_ENDPOINT':
    case 'INCOMPLETE_REQUEST_BODY':
    case 'EMPTY_RESPONSE':
    case 'INCONSISTENT_FIELD':
    case 'MISSING_GLOBAL_ERROR_STRATEGY':
      return 'warning';
    case 'MISSING_ENDPOINT_ERRORS':
    case 'MISSING_VALIDATION_CODE':
    default:
      return 'info';
  }
};

/**
 * Filter helper matching ConsistencyValidationPanel
 */
export const filterFindings = (findings, filterType) => {
  if (filterType === 'all') return findings;
  return findings.filter((f) => f.severity === filterType);
};

/**
 * Simulated client-side repair staging workflow
 */
export const stageRepairWorkflow = (currentBlueprint, proposedBlueprint, action) => {
  // If user confirms, return proposed; if discarded, return current untouched
  if (action === 'confirm') {
    return { activeBlueprint: JSON.parse(JSON.stringify(proposedBlueprint)), applied: true };
  }
  return { activeBlueprint: JSON.parse(JSON.stringify(currentBlueprint)), applied: false };
};

async function runFrontendConsistencyTests() {
  console.log('--- RUNNING FRONTEND CONSISTENCY VALIDATION & REPAIR TESTS ---');

  // Test 1: Severity classification mapping
  console.log('Test 1: Severity Classification Logic');
  assert.strictEqual(classifyFindingSeverity('DUPLICATE_ENDPOINT'), 'error');
  assert.strictEqual(classifyFindingSeverity('INVALID_METHOD'), 'error');
  assert.strictEqual(classifyFindingSeverity('UNDEFINED_MODEL'), 'error');
  assert.strictEqual(classifyFindingSeverity('UNPROTECTED_ENDPOINT'), 'warning');
  assert.strictEqual(classifyFindingSeverity('INCOMPLETE_REQUEST_BODY'), 'warning');
  assert.strictEqual(classifyFindingSeverity('MISSING_ENDPOINT_ERRORS'), 'info');
  console.log('✓ Passed Test 1: Classification mapping conforms to specifications');

  // Test 2: Panel filtering by severity
  console.log('Test 2: Panel filtering by severity tabs');
  const mockFindings = [
    { id: 'f1', severity: 'error', title: 'Duplicate endpoint' },
    { id: 'f2', severity: 'error', title: 'Missing HTTP method' },
    { id: 'f3', severity: 'warning', title: 'Unprotected POST /orders' },
    { id: 'f4', severity: 'warning', title: 'Incomplete body' },
    { id: 'f5', severity: 'info', title: 'Document error codes' }
  ];

  assert.strictEqual(filterFindings(mockFindings, 'all').length, 5);
  assert.strictEqual(filterFindings(mockFindings, 'error').length, 2);
  assert.strictEqual(filterFindings(mockFindings, 'warning').length, 2);
  assert.strictEqual(filterFindings(mockFindings, 'info').length, 1);
  console.log('✓ Passed Test 2: Panel severity filtering verified');

  // Test 3: Staged repair preserves original if discarded
  console.log('Test 3: Staged Repair Workflow Safety');
  const originalState = { version: 1, endpoints: ['POST /orders (unprotected)'] };
  const proposedState = { version: 2, endpoints: ['POST /orders (JWT Protected)'] };

  // Action: Discard
  const discardResult = stageRepairWorkflow(originalState, proposedState, 'discard');
  assert.strictEqual(discardResult.applied, false);
  assert.strictEqual(discardResult.activeBlueprint.version, 1, 'Original state must remain active on discard');

  // Action: Confirm
  const confirmResult = stageRepairWorkflow(originalState, proposedState, 'confirm');
  assert.strictEqual(confirmResult.applied, true);
  assert.strictEqual(confirmResult.activeBlueprint.version, 2, 'Proposed state becomes active only upon confirmation');
  console.log('✓ Passed Test 3: Staged repair confirmation & discard mechanics verified');

  console.log('=== ALL FRONTEND CONSISTENCY & REPAIR TESTS PASSED! ===');
}

runFrontendConsistencyTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
