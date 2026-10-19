import assert from 'assert';
import {
  generateExportFilename,
  extractFileManifest,
  generateArchitectureExportBundle,
  generateArchitectureMarkdown
} from '../src/services/exportService.js';
import { analyzeRequirements } from '../src/services/aiService.js';
import { validateArchitectureConsistency, summarizeFindings } from '../src/services/consistencyValidator.js';

async function runTests() {
  console.log('--- RUNNING ARCHITECTURE EXPORT TESTS ---');

  // Sample project and blueprint
  const project = {
    name: 'QuickBite Food Delivery',
    description: 'Food ordering app with real-time driver tracking and restaurant menus',
    projectType: 'Web Application',
    preferredStack: 'MERN'
  };

  const blueprint = await analyzeRequirements(project);
  assert.ok(blueprint, 'Blueprint must be generated');

  const findings = validateArchitectureConsistency(blueprint);
  const summary = summarizeFindings(findings);

  // Test 1: Filename Slug Generation
  console.log('Test 1: Filename Slug Generation');
  assert.strictEqual(generateExportFilename('QuickBite Food Delivery', 'json'), 'quickbite-food-delivery-architecture.json');
  assert.strictEqual(generateExportFilename('Hospital & Medical System v2.0!', 'md'), 'hospital-medical-system-v2-0-architecture.md');
  assert.strictEqual(generateExportFilename('Cloud Architecture', 'json'), 'cloud-architecture.json');
  assert.strictEqual(generateExportFilename('', 'json'), 'system-architecture.json');
  assert.strictEqual(generateExportFilename(null, 'md'), 'system-architecture.md');
  console.log('✓ Passed Test 1: Filename slugs generated accurately');

  // Test 2: File Manifest & Descriptions Extraction
  console.log('Test 2: File Manifest & Descriptions Extraction');
  const manifest = extractFileManifest(blueprint);
  assert.ok(Array.isArray(manifest), 'Manifest must be an array');
  assert.ok(manifest.length > 0, 'Manifest must contain extracted files');

  // Verify manifest items have path, description, and type
  manifest.forEach(item => {
    assert.ok(typeof item.path === 'string' && item.path.length > 0, 'Item must have path string');
    assert.ok(typeof item.description === 'string' && item.description.length > 0, 'Item must have description');
    assert.ok(typeof item.type === 'string' && item.type.length > 0, 'Item must have type');
  });

  // Verify specific entity and module files exist
  const hasModels = manifest.some(f => f.path.includes('backend/src/models/'));
  assert.ok(hasModels, 'Manifest must contain database model files');
  console.log(`✓ Passed Test 2: Extracted ${manifest.length} documented files with descriptions`);

  // Test 3: Complete JSON Export Bundle Structure
  console.log('Test 3: Complete JSON Export Bundle Structure');
  const projectObj = { ...project, generatedBlueprint: blueprint };
  const bundle = generateArchitectureExportBundle(projectObj, findings, summary);

  // Validate all required fields specified by requirements
  assert.ok(bundle.metadata, 'Export must include metadata');
  assert.strictEqual(bundle.metadata.projectName, 'QuickBite Food Delivery');
  assert.ok(bundle.metadata.exportedAt, 'Export must have timestamp');
  assert.strictEqual(bundle.metadata.generator, 'Vision2System Architecture Engine');

  assert.ok(bundle.overview, 'Export must include overview');
  assert.ok(bundle.architectureTopology, 'Export must include architectureTopology');
  assert.ok(Array.isArray(bundle.modules), 'Export must include modules array');
  assert.ok(bundle.modules.length > 0, 'Modules array must be populated');

  assert.ok(Array.isArray(bundle.apiEndpoints), 'Export must include apiEndpoints array');
  assert.ok(bundle.apiEndpoints.length > 0, 'API endpoints array must be populated');

  assert.ok(Array.isArray(bundle.databaseSchemas), 'Export must include databaseSchemas array');
  assert.ok(bundle.databaseSchemas.length > 0, 'Database schemas array must be populated');

  assert.ok(bundle.folderStructure, 'Export must include folderStructure');
  assert.ok(Array.isArray(bundle.fileDescriptions), 'Export must include fileDescriptions array');
  assert.ok(bundle.fileDescriptions.length > 0, 'File descriptions must be populated');

  assert.ok(bundle.validationFindings, 'Export must include validationFindings');
  assert.ok(bundle.validationFindings.summary, 'Validation findings must include summary');
  assert.ok(Array.isArray(bundle.validationFindings.findings), 'Validation findings must include findings array');
  console.log('✓ Passed Test 3: Export bundle contains all required sections');

  // Test 4: JSON Validity and Round-Trip Parseability
  console.log('Test 4: JSON Validity and Round-Trip Parseability');
  const serialized = JSON.stringify(bundle, null, 2);
  assert.ok(typeof serialized === 'string' && serialized.length > 100, 'Serialized JSON must be valid string');

  const parsed = JSON.parse(serialized);
  assert.strictEqual(parsed.metadata.projectName, bundle.metadata.projectName);
  assert.strictEqual(parsed.modules.length, bundle.modules.length);
  assert.strictEqual(parsed.apiEndpoints.length, bundle.apiEndpoints.length);
  assert.strictEqual(parsed.fileDescriptions.length, bundle.fileDescriptions.length);
  console.log('✓ Passed Test 4: JSON is strictly valid, formatted, and parses cleanly');

  // Test 5: Formatted Markdown Export with File Manifest and Findings
  console.log('Test 5: Formatted Markdown Export with File Manifest and Findings');
  const markdown = generateArchitectureMarkdown(blueprint, project.name, { project, findings, summary });

  assert.ok(markdown.includes('# Technical Architecture Blueprint: QuickBite Food Delivery'), 'Markdown has title');
  assert.ok(markdown.includes('## 1. Executive Overview & Problem Statement'), 'Markdown has Section 1');
  assert.ok(markdown.includes('## 2. System Architecture & Topology'), 'Markdown has Section 2');
  assert.ok(markdown.includes('## 3. Modular System Breakdown'), 'Markdown has Section 3');
  assert.ok(markdown.includes('## 4. REST API Endpoints Specification'), 'Markdown has Section 4');
  assert.ok(markdown.includes('## 5. Database Schema & Entities'), 'Markdown has Section 5');
  assert.ok(markdown.includes('## 6. Error Handling & Resilience Architecture'), 'Markdown has Section 6');
  assert.ok(markdown.includes('## 7. Security & Access Control'), 'Markdown has Section 7');
  assert.ok(markdown.includes('## 8. Directory & Folder Structure'), 'Markdown has Section 8');
  assert.ok(markdown.includes('### File Descriptions & Manifest'), 'Markdown has File Descriptions table');
  assert.ok(markdown.includes('## 9. Architecture Consistency & Validation Findings'), 'Markdown has Validation Findings');
  assert.ok(markdown.includes('## 10. Implementation Roadmap & Milestones'), 'Markdown has Roadmap');
  console.log('✓ Passed Test 5: Markdown specification contains all 10 required architectural sections');

  // Test 6: Graceful Handling of Empty or Null Input
  console.log('Test 6: Graceful Handling of Empty or Null Input');
  const emptyBundle = generateArchitectureExportBundle(null, null, null);
  assert.ok(emptyBundle.metadata, 'Empty input must return valid fallback metadata');
  assert.ok(Array.isArray(emptyBundle.fileDescriptions), 'Empty input must return array for file descriptions');
  const emptyJson = JSON.stringify(emptyBundle);
  assert.ok(JSON.parse(emptyJson), 'Empty bundle must serialize and parse without error');

  const emptyMd = generateArchitectureMarkdown(null);
  assert.ok(emptyMd.includes('No architecture data available'), 'Empty markdown handled gracefully');
  console.log('✓ Passed Test 6: Graceful fallback and error resistance verified');

  console.log('=== ALL ARCHITECTURE EXPORT TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Export test failed:', err);
  process.exit(1);
});
