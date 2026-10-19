/**
 * AI Architecture Evaluation Dataset
 * Standardized test cases across diverse application domains,
 * structural validation constraints, and failure modes.
 */

export const EVALUATION_DATASET = [
  {
    id: 'eval-food-delivery',
    domain: 'Food Delivery',
    name: 'QuickBite On-Demand Food Delivery',
    description: 'Food delivery platform with restaurant menus, live driver tracking, real-time order status, and checkout payments.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'domain_generation',
    expectedEntities: ['User', 'Restaurant', 'MenuItem', 'Order'],
    expectedEndpoints: ['/api/v1/restaurants', '/api/v1/orders'],
    expectedModules: ['Food Catalog', 'Order & Delivery Engine'],
    requiresRealtime: true,
    requiresAuth: true
  },
  {
    id: 'eval-ecommerce',
    domain: 'E-Commerce',
    name: 'ShopSphere Online Retail Marketplace',
    description: 'E-commerce marketplace with product catalog, shopping cart, customer reviews, Stripe checkout, and inventory tracking.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'domain_generation',
    expectedEntities: ['Product', 'Order', 'User'],
    expectedEndpoints: ['/api/v1/products', '/api/v1/cart', '/api/v1/checkout'],
    expectedModules: ['Product Catalog', 'Cart & Checkout'],
    requiresRealtime: false,
    requiresAuth: true
  },
  {
    id: 'eval-task-management',
    domain: 'Task Management',
    name: 'TaskFlow Agile Kanban Workspace',
    description: 'Collaborative project and task management system with Kanban boards, sprint milestones, team assignments, and deadline notifications.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'domain_generation',
    expectedEntities: ['User', 'Project', 'Board', 'Task'],
    expectedEndpoints: ['/api/v1/projects', '/api/v1/boards', '/api/v1/tasks'],
    expectedModules: ['Workspace & Identity', 'Kanban Board & Task Engine'],
    requiresRealtime: true,
    requiresAuth: true
  },
  {
    id: 'eval-healthcare-booking',
    domain: 'Booking & Healthcare',
    name: 'CareMed Clinic Appointment Engine',
    description: 'Healthcare patient portal and doctor appointment booking system with calendar slots, medical history records, and digital prescriptions.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'domain_generation',
    expectedEntities: ['Doctor', 'Patient', 'Appointment'],
    expectedEndpoints: ['/api/v1/doctors', '/api/v1/appointments'],
    expectedModules: ['Doctor & Patient Portal', 'Appointment Booking Engine'],
    requiresRealtime: false,
    requiresAuth: true
  },
  {
    id: 'eval-invalid-input',
    domain: 'Edge Case: Input Validation',
    name: '',
    description: '',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'input_validation',
    expectedEntities: [],
    expectedEndpoints: [],
    expectedFailure: true,
    expectedErrorType: 'VALIDATION_ERROR'
  },
  {
    id: 'eval-malformed-json',
    domain: 'Edge Case: Malformed AI Output',
    name: 'Broken JSON Test System',
    description: 'Simulates Gemini AI returning unclosed JSON fences or truncated syntax.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'malformed_json_resilience',
    expectedEntities: ['User'],
    expectedFailure: false, // Must be recovered by fallback parser
    expectedErrorType: null
  },
  {
    id: 'eval-api-rate-limit',
    domain: 'Edge Case: API Rate Limit',
    name: 'Rate Limited Application',
    description: 'Simulates upstream Gemini 429 RESOURCE_EXHAUSTED rate limit error.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'rate_limit_resilience',
    expectedEntities: ['User'],
    expectedFailure: false, // Must be handled gracefully via fallback
    expectedErrorType: null
  },
  {
    id: 'eval-api-timeout',
    domain: 'Edge Case: API Timeout',
    name: 'Network Timeout System',
    description: 'Simulates network socket delay exceeding response threshold.',
    projectType: 'Web Application',
    preferredStack: 'MERN',
    type: 'timeout_resilience',
    expectedEntities: ['User'],
    expectedFailure: false, // Must be handled gracefully via fallback
    expectedErrorType: null
  }
];
