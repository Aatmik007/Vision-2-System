import assert from 'node:assert';
import {
  validateArchitectureBlueprint,
  deriveModulesFromBlueprint,
  generateArchitectureMarkdown,
  ArchitectureBlueprintSchema
} from '../src/validators/architectureSchema.js';
import { analyzeRequirements } from '../src/services/aiService.js';

async function runTests() {
  console.log('--- RUNNING AI VALIDATION & SCHEMA TESTS ---');

  // Test 1: Rejection of invalid non-object input
  console.log('Test 1: Rejection of null/invalid input');
  const invalidResult1 = validateArchitectureBlueprint(null);
  assert.strictEqual(invalidResult1.success, false, 'Null input must fail validation');

  const invalidResult2 = validateArchitectureBlueprint('not an object');
  assert.strictEqual(invalidResult2.success, false, 'String input must fail validation');
  console.log('✓ Passed Test 1');

  // Test 2: Missing required overview should fail
  console.log('Test 2: Rejection of missing required overview');
  const missingOverview = {
    problemStatement: 'Some statement without overview'
  };
  const invalidResult3 = validateArchitectureBlueprint(missingOverview);
  assert.strictEqual(invalidResult3.success, false, 'Missing overview must fail validation');
  console.log('✓ Passed Test 2');

  // Test 3: Valid blueprint passing Zod validation & populating defaults
  console.log('Test 3: Valid minimal blueprint satisfies Zod schema');
  const minimalValid = {
    overview: 'A high-concurrency microservices platform designed for enterprise inventory management.'
  };
  const validResult = validateArchitectureBlueprint(minimalValid);
  assert.strictEqual(validResult.success, true, 'Minimal valid blueprint must pass');
  assert.ok(validResult.data.modules.length > 0, 'Must automatically derive modules');
  assert.ok(validResult.data.errorHandling.strategy, 'Must populate default error handling strategy');
  assert.ok(validResult.data.errorHandling.httpCodes.length >= 4, 'Must provide default HTTP error codes');
  console.log('✓ Passed Test 3');

  // Test 4: Dynamic Domain Fallback for Food Delivery prompt
  console.log('Test 4: Dynamic Fallback for "Build a food delivery website"');
  const foodProject = {
    name: 'QuickBite',
    description: 'Build a food delivery website with restaurant menus, live driver tracking, and order checkout',
    projectType: 'Web Application',
    preferredStack: 'MERN'
  };
  const foodBlueprint = await analyzeRequirements(foodProject);
  assert.ok(foodBlueprint, 'Blueprint must be returned');
  assert.ok(foodBlueprint.overview.toLowerCase().includes('food') || foodBlueprint.overview.toLowerCase().includes('delivery'), 'Overview must be domain-specific');
  const hasRestaurantEntity = foodBlueprint.entities.some(e => e.name.toLowerCase().includes('restaurant') || e.name.toLowerCase().includes('menu') || e.name.toLowerCase().includes('order'));
  assert.ok(hasRestaurantEntity, 'Entities must include Restaurant, Menu, or Order');
  assert.ok(foodBlueprint.modules.length >= 2, 'Modules must be populated');
  assert.ok(foodBlueprint.errorHandling?.strategy, 'Error handling must be defined');
  console.log('✓ Passed Test 4');

  // Test 5: Dynamic Domain Fallback for Hospital Management prompt
  console.log('Test 5: Dynamic Fallback for "Build a hospital management system"');
  const hospitalProject = {
    name: 'CareMed',
    description: 'Build a hospital management system for patient appointments, doctor scheduling, and medical records',
    projectType: 'Web Application',
    preferredStack: 'MERN'
  };
  const hospitalBlueprint = await analyzeRequirements(hospitalProject);
  assert.ok(hospitalBlueprint, 'Hospital blueprint must be returned');
  assert.ok(hospitalBlueprint.overview.toLowerCase().includes('hospital') || hospitalBlueprint.overview.toLowerCase().includes('health'), 'Overview must be hospital-specific');
  const hasDoctorPatientEntity = hospitalBlueprint.entities.some(e => e.name.toLowerCase().includes('patient') || e.name.toLowerCase().includes('doctor') || e.name.toLowerCase().includes('appointment'));
  assert.ok(hasDoctorPatientEntity, 'Entities must include Patient, Doctor, or Appointment');
  console.log('✓ Passed Test 5');

  // Test 6: Verify outputs are distinct and NOT identical
  console.log('Test 6: Distinct prompts produce distinct blueprints');
  assert.notStrictEqual(foodBlueprint.overview, hospitalBlueprint.overview, 'Food and Hospital overviews must differ');
  assert.notStrictEqual(foodBlueprint.entities[1]?.name, hospitalBlueprint.entities[1]?.name, 'Entities must differ');
  console.log('✓ Passed Test 6');

  // Test 7: Markdown Generation
  console.log('Test 7: Markdown specification export');
  const markdown = generateArchitectureMarkdown(foodBlueprint, 'QuickBite Food App');
  assert.ok(markdown.includes('# Technical Architecture Blueprint: QuickBite Food App'), 'Markdown must have header');
  assert.ok(markdown.includes('## 1. Executive Overview'), 'Markdown must include Executive Overview');
  assert.ok(markdown.includes('## 2. System Architecture & Topology'), 'Markdown must include Architecture');
  assert.ok(markdown.includes('## 3. Modular System Breakdown'), 'Markdown must include Modules');
  assert.ok(markdown.includes('## 4. REST API Endpoints Specification'), 'Markdown must include APIs');
  assert.ok(markdown.includes('## 5. Database Schema & Entities'), 'Markdown must include Database');
  assert.ok(markdown.includes('## 6. Error Handling & Resilience Architecture'), 'Markdown must include Error Handling');
  console.log('✓ Passed Test 7');

  console.log('=== ALL 7 AI VALIDATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
