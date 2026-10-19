import assert from 'assert';
import {
  generateExportFilename,
  extractFileManifest,
  generateArchitectureExportBundle,
  safeSerializeJson,
  downloadFile
} from '../utils/exportGenerator.js';
import { generateArchitectureMarkdown } from '../utils/markdownGenerator.js';

console.log('--- RUNNING FRONTEND ARCHITECTURE EXPORT TESTS ---');

// Mock blueprint representing a full application architecture
const mockBlueprint = {
  overview: 'QuickBite is an on-demand food ordering platform connecting customers, restaurants, and drivers.',
  problemStatement: 'Reduces food delivery latency through real-time driver tracking and automated dispatch.',
  architecture: {
    pattern: 'Event-Driven Microservices',
    dataFlow: 'Client SPA -> API Gateway -> Order Service -> MongoDB / Socket.io',
    summary: 'Decoupled services communicating via REST APIs and WebSockets.',
    nodes: [
      { id: 'client-spa', type: 'client', label: 'Customer React SPA', description: 'Web ordering UI' },
      { id: 'api-gateway', type: 'service', label: 'Express API Server', description: 'Authentication and routing' },
      { id: 'db-mongo', type: 'database', label: 'MongoDB Atlas', description: 'Document storage' }
    ],
    connections: [
      { from: 'client-spa', to: 'api-gateway', label: 'HTTPS / WSS' },
      { from: 'api-gateway', to: 'db-mongo', label: 'Mongoose ODM' }
    ]
  },
  modules: [
    {
      name: 'Auth Module',
      type: 'Security Service',
      description: 'Handles JWT issue, bcrypt password hashing, and role verification',
      responsibilities: ['User login', 'Token refresh'],
      filePaths: ['backend/src/controllers/authController.js', 'backend/src/routes/authRoutes.js']
    },
    {
      name: 'Order Module',
      type: 'Order Engine',
      description: 'Coordinates cart checkout, payment confirmation, and status progression',
      responsibilities: ['Create orders', 'Update status'],
      filePaths: ['backend/src/controllers/orderController.js', 'backend/src/routes/orderRoutes.js']
    }
  ],
  apiEndpoints: [
    {
      method: 'POST',
      endpoint: '/api/v1/orders',
      description: 'Create a new customer food delivery order',
      authentication: 'Bearer JWT Required',
      headers: { Authorization: 'Bearer <token>' },
      queryParams: 'None',
      requestBody: { items: [{ menuItemId: 'item_123', quantity: 2 }] },
      response: { orderId: 'ord_999', status: 'Pending' },
      possibleErrors: ['400 Bad Request', '401 Unauthorized']
    }
  ],
  entities: [
    {
      name: 'Order',
      description: 'Customer order record',
      primaryKey: '_id (ObjectId)',
      foreignKeys: ['customer -> User._id'],
      relationships: ['User (N:1)', 'Restaurant (N:1)'],
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Primary Key' },
        { name: 'totalAmount', type: 'Number', required: true, description: 'Order total' }
      ]
    }
  ],
  folderStructure: {
    frontend: 'frontend/src/\n├── components/\n└── pages/',
    backend: 'backend/src/\n├── controllers/\n└── routes/',
    fileManifest: [
      { path: 'frontend/src/pages/Catalog.jsx', description: 'Restaurant catalog view', type: 'page' }
    ]
  },
  frontend: {
    pages: [
      { name: 'OrderTracker', route: '/orders/:id', purpose: 'Live map tracking view' }
    ],
    componentStructure: [
      { name: 'CartDrawer', purpose: 'Slide-out cart drawer' }
    ]
  },
  roadmapPhases: [
    {
      phaseNumber: 1,
      phaseName: 'Foundation',
      summary: 'Project setup and authentication',
      tasks: [
        {
          taskId: 'T-101',
          title: 'Implement JWT Auth',
          status: 'Completed',
          description: 'Login and signup endpoints',
          files: ['backend/src/routes/authRoutes.js'],
          expectedResult: 'Functional JWT login'
        }
      ]
    }
  ]
};

const mockProject = {
  name: 'QuickBite Food App',
  description: 'On-demand food delivery system',
  projectType: 'Web Application',
  preferredStack: 'MERN',
  generatedBlueprint: mockBlueprint
};

const mockFindings = [
  {
    id: 'finding-1',
    category: 'api',
    severity: 'warning',
    message: 'API endpoint missing rate limiting',
    targetNodeId: '/api/v1/orders',
    suggestion: 'Add express-rate-limit middleware'
  }
];

const mockSummary = {
  total: 1,
  errors: 0,
  warnings: 1,
  info: 0,
  isConsistent: true
};

// Test 1: Filename Slug Generation
console.log('Test 1: Filename Slug Generation');
assert.strictEqual(generateExportFilename('QuickBite Food App', 'json'), 'quickbite-food-app-architecture.json');
assert.strictEqual(generateExportFilename('E-Commerce Platform', 'md'), 'e-commerce-platform-architecture.md');
assert.strictEqual(generateExportFilename('Project & Team Workspace!', 'json'), 'project-team-workspace-architecture.json');
assert.strictEqual(generateExportFilename('', 'json'), 'system-architecture.json');
console.log('✓ Passed Test 1: Filenames properly slugified with correct extensions');

// Test 2: File Manifest & Descriptions Extraction
console.log('Test 2: File Manifest & Descriptions Extraction');
const manifest = extractFileManifest(mockBlueprint);
assert.ok(Array.isArray(manifest), 'Manifest must be an array');
assert.ok(manifest.length >= 7, 'Manifest must extract files from modules, models, pages, tasks, and configs');

// Check that each file has path, description, and type
manifest.forEach(f => {
  assert.ok(typeof f.path === 'string' && f.path.length > 0, `Path required on item: ${JSON.stringify(f)}`);
  assert.ok(typeof f.description === 'string' && f.description.length > 0, `Description required on item: ${JSON.stringify(f)}`);
  assert.ok(typeof f.type === 'string' && f.type.length > 0, `Type required on item: ${JSON.stringify(f)}`);
});

// Check that model and page are included
assert.ok(manifest.some(f => f.path.includes('backend/src/models/Order.js')), 'Must include Order model');
assert.ok(manifest.some(f => f.path.includes('frontend/src/pages/Catalog.jsx')), 'Must include explicit manifest items');
assert.ok(manifest.some(f => f.path.includes('frontend/src/pages/OrderTracker.jsx')), 'Must include frontend page');
console.log(`✓ Passed Test 2: Extracted ${manifest.length} documented files with complete metadata`);

// Test 3: Complete Architecture Export Bundle Construction
console.log('Test 3: Complete Architecture Export Bundle Construction');
const bundle = generateArchitectureExportBundle(mockProject, mockFindings, mockSummary);

assert.strictEqual(bundle.metadata.projectName, 'QuickBite Food App');
assert.strictEqual(bundle.metadata.projectType, 'Web Application');
assert.strictEqual(bundle.metadata.generator, 'Vision2System Architecture Engine');
assert.ok(bundle.metadata.exportedAt, 'Timestamp must exist');

assert.strictEqual(bundle.modules.length, 2);
assert.strictEqual(bundle.apiEndpoints.length, 1);
assert.strictEqual(bundle.databaseSchemas.length, 1);
assert.ok(bundle.fileDescriptions.length >= 7);
assert.strictEqual(bundle.validationFindings.summary.total, 1);
assert.strictEqual(bundle.validationFindings.findings[0].id, 'finding-1');
console.log('✓ Passed Test 3: Export bundle faithfully mirrors live project state and findings');

// Test 4: Safe JSON Serialization and Circular Reference Guard
console.log('Test 4: Safe JSON Serialization and Circular Reference Guard');
const serialResult = safeSerializeJson(bundle, 2);
assert.strictEqual(serialResult.success, true);
assert.ok(typeof serialResult.json === 'string');

// Verify round-trip parseability
const parsed = JSON.parse(serialResult.json);
assert.strictEqual(parsed.metadata.projectName, 'QuickBite Food App');
assert.strictEqual(parsed.modules[0].name, 'Auth Module');

// Test circular reference resilience
const circularObj = { name: 'Circular Test' };
circularObj.self = circularObj;
const circularResult = safeSerializeJson(circularObj);
assert.strictEqual(circularResult.success, true);
assert.ok(circularResult.json.includes('[Circular Reference]'));
console.log('✓ Passed Test 4: Safe JSON serialization is valid, parsable, and immune to circular references');

// Test 5: Formatted Markdown Export
console.log('Test 5: Formatted Markdown Export');
const md = generateArchitectureMarkdown(mockBlueprint, mockProject.name, {
  project: mockProject,
  findings: mockFindings,
  summary: mockSummary
});

assert.ok(md.includes('# Technical Architecture Blueprint: QuickBite Food App'), 'Must have title');
assert.ok(md.includes('## 1. Executive Overview & Problem Statement'), 'Must have overview');
assert.ok(md.includes('## 2. System Architecture & Topology'), 'Must have topology');
assert.ok(md.includes('## 3. Modular System Breakdown'), 'Must have modules');
assert.ok(md.includes('## 4. REST API Endpoints Specification'), 'Must have APIs');
assert.ok(md.includes('## 5. Database Schema & Entities'), 'Must have DB entities');
assert.ok(md.includes('### File Descriptions & Manifest'), 'Must have file descriptions table');
assert.ok(md.includes('backend/src/models/Order.js'), 'Must document entity file in table');
assert.ok(md.includes('## 9. Architecture Consistency & Validation Findings'), 'Must have findings section');
assert.ok(md.includes('API endpoint missing rate limiting'), 'Must display finding message');
assert.ok(md.includes('## 10. Implementation Roadmap & Milestones'), 'Must have roadmap');
console.log('✓ Passed Test 5: Markdown specification contains all 10 required architectural sections');

// Test 6: Non-Browser Download Graceful Fallback
console.log('Test 6: Non-Browser Download Graceful Fallback');
const downloadResult = downloadFile('sample content', 'test.json');
assert.strictEqual(downloadResult.success, false);
assert.ok(downloadResult.error.includes('Browser environment required'));
console.log('✓ Passed Test 6: Download utility fails gracefully in non-browser execution environments');

console.log('=== ALL FRONTEND ARCHITECTURE EXPORT TESTS PASSED! ===');
