import assert from 'node:assert';
import {
  validateArchitectureConsistency,
  summarizeFindings
} from '../src/services/consistencyValidator.js';
import { repairArchitectureBlueprint } from '../src/services/architectureRepairService.js';
import { validateArchitectureBlueprint } from '../src/validators/architectureSchema.js';


async function runConsistencyTests() {
  console.log('--- RUNNING ARCHITECTURE CONSISTENCY & REPAIR TESTS ---');

  // Test 1: Faulty blueprint with deliberate inconsistencies
  console.log('Test 1: Detecting all categories of consistency defects');
  const faultyBlueprint = {
    overview: 'E-commerce platform with multiple intentional architectural defects.',
    entities: [
      {
        name: 'Order',
        description: 'Orders document',
        primaryKey: '_id',
        foreignKeys: [
          'userId -> User.userId', // Inconsistent field: User only has _id
          'storeId -> NonExistentStore._id' // Undefined model reference
        ],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'ID' },
          { name: 'total', type: 'Number', required: true, description: 'Total' }
        ]
      },
      {
        name: 'User',
        description: 'User document',
        primaryKey: '_id',
        foreignKeys: [],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'ID' },
          { name: 'name', type: 'String', required: true, description: 'Name' }
        ]
      }
    ],
    relationships: [
      { from: 'Customer', to: 'Order', type: '1:N', description: 'Undefined Customer entity' }
    ],
    apiEndpoints: [
      {
        method: '', // Missing method
        endpoint: '/api/v1/orders',
        description: 'Missing method endpoint',
        authentication: 'Public',
        requestBody: 'None',
        response: '{}',
        possibleErrors: []
      },
      {
        method: 'POST',
        endpoint: '/api/v1/orders',
        description: 'Duplicate 1',
        authentication: 'Public', // Unprotected mutating endpoint
        requestBody: 'None', // Incomplete request body
        response: '{}', // Incomplete response
        possibleErrors: [] // Missing error handling
      },
      {
        method: 'POST',
        endpoint: '/api/v1/orders', // Duplicate 2
        description: 'Duplicate 2',
        authentication: 'Public',
        requestBody: 'None',
        response: '{}',
        possibleErrors: []
      }
    ],
    architecture: {
      nodes: [
        { id: 'client', label: 'Client', type: 'frontend' },
        { id: 'gateway', label: 'Gateway', type: 'api' }
      ],
      connections: [
        { from: 'client', to: 'gateway', label: 'HTTPS' },
        { from: 'gateway', to: 'orphan_node', label: 'Broken connection' } // Broken connection
      ]
    },
    errorHandling: {
      strategy: 'Basic try/catch',
      httpCodes: [{ code: '500', scenario: 'Internal crash', responseFormat: '{}' }] // Missing 400
    }
  };

  const findings = validateArchitectureConsistency(faultyBlueprint);
  const summary = summarizeFindings(findings);

  assert.ok(findings.length >= 6, 'Must detect at least 6 distinct findings');
  assert.strictEqual(summary.isConsistent, false, 'Summary must indicate inconsistent architecture');
  assert.ok(summary.errors > 0, 'Must identify critical errors');
  assert.ok(summary.warnings > 0, 'Must identify warnings');
  assert.ok(summary.info > 0, 'Must identify info suggestions');

  // Verify specific defect detections
  assert.ok(findings.some((f) => f.title.includes('Duplicate Endpoint')), 'Must detect duplicate endpoints');
  assert.ok(findings.some((f) => f.title.includes('Invalid HTTP Method')), 'Must detect missing/invalid HTTP method');
  assert.ok(findings.some((f) => f.title.includes('Incomplete Request Body')), 'Must detect missing request body');
  assert.ok(findings.some((f) => f.title.includes('Undefined Entity Reference')), 'Must detect undefined entity in relationship');
  assert.ok(findings.some((f) => f.title.includes('Undefined Foreign Key Target Model')), 'Must detect undefined FK model');
  assert.ok(findings.some((f) => f.title.includes('Inconsistent Field Reference')), 'Must detect inconsistent FK field');
  assert.ok(findings.some((f) => f.title.includes('Potentially Unprotected Endpoint')), 'Must detect unprotected mutating endpoint');
  assert.ok(findings.some((f) => f.title.includes('Orphan Connection Target')), 'Must detect orphan connection');
  console.log('✓ Passed Test 1: All defect categories accurately flagged and classified');

  // Test 2: AI-Assisted Repair Execution on a Copy
  console.log('Test 2: Safe Repair on Copy without mutating original');
  const originalJsonBefore = JSON.stringify(faultyBlueprint);

  const repairResult = repairArchitectureBlueprint(faultyBlueprint);

  // Assert original was untouched
  const originalJsonAfter = JSON.stringify(faultyBlueprint);
  assert.strictEqual(originalJsonBefore, originalJsonAfter, 'Original blueprint must NOT be mutated during repair');
  console.log('✓ Passed Test 2: Immutability verified');

  // Test 3: Validate Repaired Output
  console.log('Test 3: Repaired architecture resolves targeted defects and satisfies Zod');
  const { proposed, resolvedFindingsCount, remainingFindings } = repairResult;

  assert.ok(resolvedFindingsCount > 0, 'Must resolve findings');
  assert.ok(remainingFindings.length < findings.length, 'Remaining findings must be significantly reduced');

  // Verify specific repairs
  const repairedEndpoints = proposed.apiEndpoints;
  const methods = repairedEndpoints.map((e) => e.method);
  assert.ok(!methods.includes(''), 'Missing methods must be fixed');

  const unprotected = proposed.apiEndpoints.filter((e) =>
    ['POST', 'PUT', 'DELETE'].includes(e.method) &&
    (e.authentication.toLowerCase().includes('public') || e.authentication.toLowerCase().includes('none')) &&
    !e.endpoint.includes('/login')
  );
  assert.strictEqual(unprotected.length, 0, 'Mutating endpoints must have auth enforced');

  // Verify missing entity was synthesized
  const entityNames = proposed.entities.map((e) => e.name.toLowerCase());
  assert.ok(entityNames.includes('customer'), 'Undefined Customer entity referenced in relationship must be synthesized');

  // Verify schema validation
  const zodResult = validateArchitectureBlueprint(proposed);
  assert.strictEqual(zodResult.success, true, 'Repaired blueprint must satisfy Zod schema');
  console.log('✓ Passed Test 3: Repaired blueprint validated and consistent');

  console.log('=== ALL ARCHITECTURE CONSISTENCY & REPAIR TESTS PASSED! ===');
}

runConsistencyTests().catch((err) => {
  console.error('Consistency test failure:', err);
  process.exit(1);
});
