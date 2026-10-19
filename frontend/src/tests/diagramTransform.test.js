import assert from 'node:assert';
import {
  categorizeNodeType,
  COLUMN_X_COORDS,
  transformArchitectureToDiagram
} from '../utils/diagramTransform.js';

async function runDiagramTests() {
  console.log('--- RUNNING DIAGRAM TRANSFORMATION & VISUALIZER TESTS ---');

  // Test 1: Node Categorization
  console.log('Test 1: Node Categorization mapping');
  assert.strictEqual(categorizeNodeType('user', 'client', 'React Web Client'), 'frontendNode');
  assert.strictEqual(categorizeNodeType('frontend', 'ui_spa', 'Browser SPA'), 'frontendNode');
  assert.strictEqual(categorizeNodeType('api', 'gateway', 'REST Router'), 'apiNode');
  assert.strictEqual(categorizeNodeType('backend', 'order_controller', 'Order Controller'), 'serviceNode');
  assert.strictEqual(categorizeNodeType('service', 'auth_service', 'Auth Middleware'), 'serviceNode');
  assert.strictEqual(categorizeNodeType('database', 'mongodb', 'Users Collection'), 'databaseNode');
  assert.strictEqual(categorizeNodeType('external', 'stripe_gateway', 'Stripe Payments'), 'externalNode');
  console.log('✓ Passed Test 1: All node categories properly mapped');

  // Test 2: Column Coordinates and Non-Overlapping Layout
  console.log('Test 2: Column Placement and Non-Overlapping Coordinates');
  const mockArchitecture = {
    nodes: [
      { id: 'client_1', label: 'Customer App', type: 'frontend', description: 'Web Client' },
      { id: 'client_2', label: 'Admin App', type: 'frontend', description: 'Admin Client' },
      { id: 'api_gw', label: 'Express Gateway', type: 'api', description: 'REST Gateway' },
      { id: 'srv_1', label: 'Auth Controller', type: 'service', description: 'JWT Authentication' },
      { id: 'srv_2', label: 'Order Service', type: 'service', description: 'Order Processing' },
      { id: 'db_1', label: 'MongoDB Users', type: 'database', description: 'User collection' },
      { id: 'db_2', label: 'MongoDB Orders', type: 'database', description: 'Order collection' },
      { id: 'ext_1', label: 'Stripe API', type: 'external', description: 'Payment processing' }
    ],
    connections: [
      { from: 'client_1', to: 'api_gw', label: 'HTTPS Request' },
      { from: 'api_gw', to: 'srv_1', label: 'Route Dispatch' },
      { from: 'srv_1', to: 'db_1', label: 'Mongoose ODM' },
      { from: 'srv_2', to: 'ext_1', label: 'Payment Tokenization' }
    ]
  };

  const mockBlueprint = {
    entities: [
      {
        name: 'User',
        primaryKey: '_id',
        fields: [{ name: '_id', type: 'ObjectId' }, { name: 'email', type: 'String' }]
      },
      {
        name: 'Order',
        primaryKey: '_id',
        fields: [{ name: '_id', type: 'ObjectId' }, { name: 'total', type: 'Number' }]
      }
    ],
    apiEndpoints: [
      { method: 'POST', endpoint: '/api/v1/auth/login', description: 'User login' },
      { method: 'POST', endpoint: '/api/v1/orders', description: 'Place order' }
    ],
    modules: [
      {
        name: 'Frontend Client Module',
        type: 'frontend',
        responsibilities: ['UI render'],
        filePaths: ['frontend/src/App.jsx']
      }
    ]
  };

  const { nodes, edges } = transformArchitectureToDiagram(mockArchitecture, mockBlueprint);

  assert.strictEqual(nodes.length, 8, 'Must produce 8 diagram nodes');
  assert.strictEqual(edges.length, 4, 'Must produce 4 diagram edges');

  // Verify non-overlapping coordinates in the same column
  const frontendNodes = nodes.filter(n => n.type === 'frontendNode');
  assert.strictEqual(frontendNodes.length, 2);
  assert.strictEqual(frontendNodes[0].position.x, COLUMN_X_COORDS.frontendNode);
  assert.strictEqual(frontendNodes[1].position.x, COLUMN_X_COORDS.frontendNode);
  assert.notStrictEqual(frontendNodes[0].position.y, frontendNodes[1].position.y, 'Nodes in same column must have different Y positions');
  assert.ok(Math.abs(frontendNodes[1].position.y - frontendNodes[0].position.y) >= 120, 'Y delta must prevent visual overlap');
  console.log('✓ Passed Test 2: Column coordinates prevent visual overlap');

  // Test 3: Node Data Enrichment (APIs, Schemas, File Paths)
  console.log('Test 3: Node metadata enrichment from blueprint');
  const dbNode = nodes.find(n => n.id === 'db_1');
  assert.ok(dbNode, 'Database node must exist');
  assert.strictEqual(dbNode.type, 'databaseNode');
  assert.ok(dbNode.data.associatedEntity, 'Database node should associate with User entity');
  assert.strictEqual(dbNode.data.associatedEntity.name, 'User');

  const clientNode = nodes.find(n => n.id === 'client_1');
  assert.ok(clientNode.data.filePaths.includes('frontend/src/App.jsx'), 'Frontend node should inherit module file paths');
  console.log('✓ Passed Test 3: Metadata enrichment verified');

  // Test 4: Edge Validity and Filtering
  console.log('Test 4: Edge connectivity and orphan edge suppression');
  const architectureWithInvalidEdge = {
    nodes: [
      { id: 'node_a', label: 'Node A', type: 'frontend' },
      { id: 'node_b', label: 'Node B', type: 'api' }
    ],
    connections: [
      { from: 'node_a', to: 'node_b', label: 'Valid Link' },
      { from: 'node_a', to: 'non_existent_node', label: 'Invalid Link' }
    ]
  };

  const resultWithInvalidEdge = transformArchitectureToDiagram(architectureWithInvalidEdge, {});
  assert.strictEqual(resultWithInvalidEdge.edges.length, 1, 'Invalid edge with missing destination must be dropped');
  assert.strictEqual(resultWithInvalidEdge.edges[0].source, 'node_a');
  assert.strictEqual(resultWithInvalidEdge.edges[0].target, 'node_b');
  console.log('✓ Passed Test 4: Invalid/orphan edges safely filtered');

  // Test 5: Dynamic Fallback Generation on Empty/Minimal Input
  console.log('Test 5: Graceful synthesis when architecture is empty');
  const emptyResult = transformArchitectureToDiagram({}, {});
  assert.ok(emptyResult.nodes.length >= 3, 'Must synthesize default topology on empty input');
  assert.ok(emptyResult.edges.length >= 2, 'Must synthesize default edges on empty input');
  console.log('✓ Passed Test 5: Graceful fallback synthesis verified');

  console.log('=== ALL 5 DIAGRAM TRANSFORMATION TESTS PASSED SUCCESSFULLY! ===');
}

runDiagramTests().catch(err => {
  console.error('Diagram test failure:', err);
  process.exit(1);
});
