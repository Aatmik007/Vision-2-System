import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Validates that an AI output object conforms to the technical blueprint schema.
 */
export const validateBlueprintSchema = (data) => {
  if (!data || typeof data !== 'object') return false;

  const requiredFields = [
    'overview',
    'assumptions',
    'functionalRequirements',
    'nonFunctionalRequirements',
    'userRoles',
    'features',
    'entities',
    'relationships',
    'missingRequirements'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`Validation Warning: Field '${field}' is missing in AI response.`);
      return false;
    }
  }

  return true;
};

/**
 * Analyzes project requirements using Gemini AI API and returns a production-grade structured JSON technical blueprint.
 */
export const analyzeRequirements = async (project) => {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';

  console.log("BACKEND RECEIVED PROMPT:", project.description);

  if (apiKey && apiKey.trim()) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
You are a Senior Principal Software Architect and Lead Systems Engineer.
Analyze the following project requirement and generate a production-grade, highly rigorous, developer-ready technical blueprint in STRICT VALID JSON format.

PROJECT DETAILS:
- Project Name: "${project.name}"
- Project Type: "${project.projectType || 'Web Application'}"
- Preferred Stack: "${project.preferredStack || 'Auto Detect'}"
- Requirement Description: "${project.description}"

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON with no Markdown ticks (do not use \`\`\`json), commentary, or introductory text.
2. IMPORTANT: Generate DOMAIN-SPECIFIC entities, database fields, API endpoints, features, and tech recommendations tailored strictly to "${project.description}". DO NOT return generic placeholder names like "Resource" or "Item". For example, if the requirement is for a Food Delivery app, generate entities like Restaurant, MenuItem, Order, DeliveryPartner. If for a Hospital app, generate Patient, Doctor, Appointment, MedicalRecord.
3. Provide an 8-Phase Granular Engineering Plan with 3 to 5 actionable sub-tasks per phase.
4. DO NOT include any Interview Guide section.

REQUIRED JSON SCHEMA (Substitute actual domain-specific values for this project):
{
  "overview": "Comprehensive executive summary of the architecture and business problem solved for ${project.name}.",
  "problemStatement": "Detailed description of operational challenges addressed by this platform.",
  "assumptions": ["Assumption 1 regarding scalability or data integrity."],
  "functionalRequirements": ["Requirement 1 detailing exact domain features."],
  "nonFunctionalRequirements": ["Metric 1 detailing SLA latency (<200ms) or security standard."],
  "userRoles": [
    { "role": "Domain Role Title", "description": "Role responsibility description.", "permissions": ["perm1", "perm2"] }
  ],
  "features": ["Domain-specific feature capability 1"],
  "missingRequirements": ["Ambiguity or implicit assumption requiring developer clarification."],
  "techStack": [
    { "category": "Frontend", "technology": "React 18 / Vite / Tailwind CSS", "purpose": "UI Framework", "reason": "Virtual DOM reconciliation speed." }
  ],
  "architecture": {
    "summary": "3-tier architectural breakdown tailored to ${project.name}.",
    "pattern": "Express MVC REST API + React SPA",
    "dataFlow": "Client -> Nginx Proxy -> Express AuthMiddleware -> Controller -> Mongoose -> MongoDB",
    "nodes": [
      { "id": "client", "label": "React SPA Client", "type": "user", "description": "Browser Interface" },
      { "id": "backend", "label": "Express Server & Controllers", "type": "backend", "description": "Domain REST API" },
      { "id": "database", "label": "MongoDB Database", "type": "database", "description": "Indexed Document Store" }
    ],
    "connections": [
      { "from": "client", "to": "backend", "label": "HTTPS REST API" },
      { "from": "backend", "to": "database", "label": "Mongoose ODM Queries" }
    ]
  },
  "entities": [
    {
      "name": "DomainEntityName",
      "description": "Description of entity.",
      "primaryKey": "_id (ObjectId)",
      "foreignKeys": [],
      "relationships": [],
      "fields": [
        { "name": "_id", "type": "ObjectId", "required": true, "description": "Primary key" }
      ]
    }
  ],
  "relationships": [
    { "from": "EntityA", "to": "EntityB", "type": "1:N", "description": "Relationship explanation." }
  ],
  "erDiagramText": "erDiagram\\n    ENTITYA ||--o{ ENTITYB : relates",
  "apiEndpoints": [
    {
      "method": "GET",
      "endpoint": "/api/v1/domain-resource",
      "description": "Fetches domain items.",
      "authentication": "Required (Bearer JWT)",
      "headers": "Authorization: Bearer <token>",
      "queryParams": "None",
      "requestBody": "None",
      "response": "{}",
      "possibleErrors": ["401 Unauthorized", "500 Internal Error"]
    }
  ],
  "frontend": {
    "pages": [{ "name": "Dashboard View", "route": "/dashboard", "purpose": "Purpose", "components": ["Comp"], "apiCalls": ["GET"] }],
    "componentStructure": [{ "name": "Layout", "type": "Wrapper", "purpose": "Layout" }]
  },
  "folderStructure": { "frontend": "frontend/src/", "backend": "backend/src/" },
  "security": [{ "item": "Security Control", "recommendation": "Recommendation", "relevance": "Relevance" }],
  "roadmapPhases": [
    {
      "phaseNumber": 1,
      "phaseName": "Phase 1: Environment Setup & Base Config",
      "summary": "Summary",
      "tasks": [
        { "taskId": "1.1", "title": "Setup", "description": "Desc", "whatToBuild": "Build", "files": ["app.js"], "dependencies": "Node", "expectedResult": "Success", "status": "Completed" }
      ]
    }
  ],
  "testing": [{ "type": "Unit", "tool": "Jest", "strategy": "Strategy" }],
  "deployment": {
    "platform": "Render / Vercel + MongoDB Atlas",
    "envVars": ["PORT", "MONGODB_URI"],
    "steps": ["Step 1"],
    "dockerfileSnippet": "FROM node:18-alpine\\nCMD [\\"node\\", \\"src/server.js\\"]",
    "nginxSnippet": "server { listen 80; }"
  }
}
`;

      console.log("AI PROMPT:", prompt);

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      console.log("AI RESPONSE:", responseText);

      const cleanedJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsedData = JSON.parse(cleanedJson);

      if (validateBlueprintSchema(parsedData)) {
        return parsedData;
      }
    } catch (err) {
      console.error('Gemini AI Blueprint Generation Error:', err.message);
    }
  } else {
    console.log("AI PROMPT: [Gemini API Key missing or empty. Invoking Dynamic Domain Fallback Blueprint Generator]");
  }

  return generateFallbackBlueprint(project);
};

/**
 * Dynamic fallback generator producing domain-tailored technical blueprints based on user prompt.
 */
const generateFallbackBlueprint = (project) => {
  const name = project.name || 'Software Application';
  const desc = project.description || 'Application for managing core domain workflows.';
  const descLower = (desc + ' ' + name).toLowerCase();
  const pType = project.projectType || 'Web Application';
  const pStack = project.preferredStack || 'MERN';

  console.log("GENERATING DYNAMIC FALLBACK BLUEPRINT FOR PROMPT:", desc);

  // 1. Food Delivery Domain
  if (descLower.includes('food') || descLower.includes('restaurant') || descLower.includes('delivery') || descLower.includes('eat') || descLower.includes('order food') || descLower.includes('meal')) {
    return generateFoodDeliveryBlueprint(name, desc, pType, pStack);
  }

  // 2. Hospital / Healthcare / Medical Domain
  if (descLower.includes('hospital') || descLower.includes('patient') || descLower.includes('doctor') || descLower.includes('medical') || descLower.includes('health') || descLower.includes('clinic') || descLower.includes('appointment') || descLower.includes('prescription')) {
    return generateHospitalBlueprint(name, desc, pType, pStack);
  }

  // 3. E-Commerce / Shopping Domain
  if (descLower.includes('shop') || descLower.includes('store') || descLower.includes('cart') || descLower.includes('buy') || descLower.includes('ecommerce') || descLower.includes('e-commerce') || descLower.includes('product')) {
    return generateEcommerceBlueprint(name, desc, pType, pStack);
  }

  // 4. Education / School / Learning Domain
  if (descLower.includes('school') || descLower.includes('course') || descLower.includes('student') || descLower.includes('learn') || descLower.includes('college') || descLower.includes('education') || descLower.includes('tutor')) {
    return generateEducationBlueprint(name, desc, pType, pStack);
  }

  // 5. Generic / Custom Domain Dynamic Generator
  return generateGenericDynamicBlueprint(name, desc, pType, pStack);
};

/* ==========================================================================
   DOMAIN SPECIFIC FALLBACK GENERATORS
   ========================================================================== */

function generateFoodDeliveryBlueprint(name, desc, pType, pStack) {
  return {
    overview: `${name} is a high-concurrency ${pType} tailored for food ordering, multi-restaurant menu management, and real-time delivery driver tracking. It coordinates customers, restaurant managers, and delivery partners.`,
    problemStatement: `Addresses order dispatch bottlenecks, delivery delays, and menu synchronization by providing a real-time ordering platform with live status notifications.`,
    assumptions: [
      `Customers interact via mobile & desktop web browsers.`,
      `Delivery drivers enable GPS location permissions for real-time order tracking.`,
      `Payments are authorized statelessly via Stripe before kitchen dispatch.`
    ],
    functionalRequirements: [
      `Customer registration, address management, and food menu browsing.`,
      `Interactive cart management, order placement, and live status updates (Placed, Preparing, On The Way, Delivered).`,
      `Restaurant manager portal to accept/reject incoming orders and update menu item availability.`,
      `Delivery driver dashboard to claim pending delivery orders and update geolocation coordinates.`
    ],
    nonFunctionalRequirements: [
      `Real-time WebSocket event latency under < 100ms for active order status updates.`,
      `Sub-second menu search latency leveraging indexed MongoDB geospatial and text queries.`,
      `Bcrypt password salting (10 rounds) and JWT stateless bearer authorization.`
    ],
    userRoles: [
      { role: 'Customer', description: 'Browses menus, places food orders, and tracks delivery live.', permissions: ['browse_menu', 'create_order', 'track_delivery'] },
      { role: 'Restaurant Manager', description: 'Manages restaurant profile, food categories, and kitchen order status.', permissions: ['manage_menu', 'update_order_status'] },
      { role: 'Delivery Partner', description: 'Accepts assigned deliveries and updates live GPS status.', permissions: ['accept_delivery', 'update_gps'] }
    ],
    features: [
      `Real-Time Order & Driver Tracking via WebSockets (Socket.io)`,
      `Interactive Multi-Restaurant Menu Catalog & Cart Checkout`,
      `Kitchen Order Dispatch & Management Dashboard`,
      `Stripe Payment Gateway Integration`
    ],
    missingRequirements: [
      `SMS notification vendor unspecified; assumed Twitch / Twilio integration for SMS alerts.`,
      `Driver payout model unspecified; assumed weekly direct bank transfer.`
    ],
    techStack: [
      { category: 'Frontend', technology: 'React 18 & Tailwind CSS', purpose: 'Customer & Restaurant SPA Dashboard', reason: 'Fast Virtual DOM updates for live order state changes.' },
      { category: 'Backend Server', technology: 'Node.js & Express.js', purpose: 'REST API & Socket.io Server', reason: 'Event-driven I/O ideal for real-time WebSocket connections.' },
      { category: 'Database', technology: 'MongoDB & Mongoose', purpose: 'Document Store for Menus & Orders', reason: 'Flexible schema accommodating dynamic restaurant menus and order items.' },
      { category: 'Real-Time Sync', technology: 'Socket.io', purpose: 'Bidirectional Live Order & GPS Tracking', reason: 'Low-latency event emitter for customer driver maps.' }
    ],
    architecture: {
      summary: 'Event-Driven 3-Tier Architecture featuring REST API routes for CRUD and Socket.io WebSockets for real-time order updates.',
      pattern: 'Express MVC REST + Socket.io WebSockets + React SPA',
      dataFlow: 'Customer App -> Axios REST -> Express API -> Order Controller -> Mongoose -> Socket.io Broadcast -> Driver App',
      nodes: [
        { id: 'client', label: 'Customer React SPA', type: 'user', description: 'Food Browsing & Order Tracking' },
        { id: 'gateway', label: 'Express REST & Socket Gateway', type: 'api', description: 'HTTP APIs & WebSocket Dispatcher' },
        { id: 'backend', label: 'Order & Kitchen Controllers', type: 'backend', description: 'Business logic & Payment verification' },
        { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Users, Restaurants, Menus & Orders Collections' }
      ],
      connections: [
        { from: 'client', to: 'gateway', label: 'HTTPS / WSS Socket Connection' },
        { from: 'gateway', to: 'backend', label: 'Route Handlers' },
        { from: 'backend', to: 'database', label: 'Mongoose ODM' }
      ]
    },
    entities: [
      {
        name: 'User',
        description: 'Represents registered platform users (Customer, Manager, Driver).',
        primaryKey: '_id (ObjectId)',
        foreignKeys: [],
        relationships: ['Order (1:N)', 'Restaurant (1:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'name', type: 'String', required: true, description: 'User full name' },
          { name: 'email', type: 'String', required: true, description: 'Unique email address' },
          { name: 'role', type: 'String', required: true, description: 'Customer | RestaurantManager | DeliveryPartner' }
        ]
      },
      {
        name: 'Restaurant',
        description: 'Stores restaurant details, cuisine types, and opening hours.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['owner -> User._id'],
        relationships: ['MenuItem (1:N)', 'Order (1:N)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'name', type: 'String', required: true, description: 'Restaurant name' },
          { name: 'cuisine', type: 'String', required: true, description: 'Cuisine category (Italian, Fast Food, Indian)' },
          { name: 'isAvailable', type: 'Boolean', required: true, description: 'Open/closed state' }
        ]
      },
      {
        name: 'MenuItem',
        description: 'Food items belonging to a specific restaurant menu.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['restaurant -> Restaurant._id'],
        relationships: ['Restaurant (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'restaurant', type: 'ObjectId', required: true, description: 'FK to Restaurant._id' },
          { name: 'name', type: 'String', required: true, description: 'Food item title' },
          { name: 'price', type: 'Number', required: true, description: 'Item price in USD/INR' }
        ]
      },
      {
        name: 'Order',
        description: 'Food order placed by a customer containing items and delivery status.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['customer -> User._id', 'restaurant -> Restaurant._id', 'driver -> User._id'],
        relationships: ['User (N:1)', 'Restaurant (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'customer', type: 'ObjectId', required: true, description: 'FK to Customer User' },
          { name: 'restaurant', type: 'ObjectId', required: true, description: 'FK to Restaurant' },
          { name: 'totalAmount', type: 'Number', required: true, description: 'Order total' },
          { name: 'orderStatus', type: 'String', required: true, description: 'Placed | Preparing | On The Way | Delivered' }
        ]
      }
    ],
    relationships: [
      { from: 'Restaurant', to: 'MenuItem', type: '1:N', description: 'Restaurant owns multiple menu items.' },
      { from: 'Customer', to: 'Order', type: '1:N', description: 'Customer places multiple food orders.' },
      { from: 'Restaurant', to: 'Order', type: '1:N', description: 'Restaurant receives multiple food orders.' }
    ],
    erDiagramText: `erDiagram\n    RESTAURANT ||--o{ MENUITEM : has\n    USER ||--o{ ORDER : places\n    RESTAURANT ||--o{ ORDER : receives`,
    apiEndpoints: [
      { method: 'GET', endpoint: '/api/v1/restaurants', description: 'Fetch all active restaurants and cuisine menus.', authentication: 'Public', headers: 'None', queryParams: 'cuisine=Italian&page=1', requestBody: 'None', response: '[{"_id":"...","name":"Pizza Palace"}]', possibleErrors: ['500 Internal Error'] },
      { method: 'POST', endpoint: '/api/v1/orders', description: 'Place a new food delivery order.', authentication: 'Required (Bearer JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: '{"restaurantId":"...","items":[{"menuItemId":"...","quantity":2}],"deliveryAddress":"123 Main St"}', response: '{"_id":"...","orderStatus":"Placed"}', possibleErrors: ['400 Bad Request', '401 Unauthorized'] },
      { method: 'GET', endpoint: '/api/v1/orders/:id/track', description: 'Get live order status and driver location.', authentication: 'Required (Bearer JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: 'None', response: '{"orderStatus":"On The Way","driverLocation":{"lat":12.9,"lng":77.6}}', possibleErrors: ['404 Not Found'] },
      { method: 'PUT', endpoint: '/api/v1/restaurants/:id/menu', description: 'Add or update restaurant menu items.', authentication: 'Required (Vendor JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: '{"name":"Burger","price":8.99}', response: '{"_id":"...","name":"Burger"}', possibleErrors: ['403 Forbidden'] }
    ],
    frontend: {
      pages: [
        { name: 'Restaurant Catalog', route: '/', purpose: 'Browse restaurants, search cuisines, and view menus.', components: ['RestaurantCard', 'CuisineFilter', 'CartDrawer'], apiCalls: ['GET /api/v1/restaurants'] },
        { name: 'Cart & Checkout Page', route: '/checkout', purpose: 'Review cart items, enter delivery address, and pay.', components: ['CartList', 'AddressForm', 'StripePayment'], apiCalls: ['POST /api/v1/orders'] },
        { name: 'Live Order Tracker', route: '/orders/:id/track', purpose: 'Interactive live map and status timeline for food delivery.', components: ['StatusTimeline', 'LiveMap', 'DriverContact'], apiCalls: ['GET /api/v1/orders/:id/track'] }
      ],
      componentStructure: [
        { name: 'RestaurantCard', type: 'UI Component', purpose: 'Displays restaurant thumbnail, rating, delivery time, and cuisine.' },
        { name: 'CartDrawer', type: 'Global State Drawer', purpose: 'Manages food item quantities and calculates subtotal/delivery fees.' }
      ]
    },
    folderStructure: {
      frontend: `frontend/src/\n├── assets/          # Images & food icons\n├── components/      # RestaurantCard, CartDrawer, LiveMap\n├── context/         # AuthContext & CartContext\n├── pages/           # Catalog, Checkout, OrderTracker, VendorDashboard\n└── services/        # API client & Socket.io listener`,
      backend: `backend/src/\n├── config/          # DB & Socket.io setup\n├── controllers/     # restaurantController, orderController\n├── models/          # User, Restaurant, MenuItem, Order\n├── routes/          # restaurantRoutes, orderRoutes\n└── sockets/         # liveTrackingHandler.js`
    },
    security: [
      { item: 'Stateless JWT Auth', recommendation: 'Require Bearer JWT for order creation and driver updates.', relevance: 'Secures user checkout flows.' },
      { item: 'Stripe Webhook Signature Verification', recommendation: 'Verify Stripe webhook signatures before marking orders as paid.', relevance: 'Prevents fraudulent order fulfillment.' }
    ],
    roadmapPhases: buildStandardRoadmapPhases(name, 'Food Delivery System', 'Order & Menu Management API', 'Food Catalog & Order Tracking UI'),
    testing: [
      { type: 'Integration Testing', tool: 'Supertest', strategy: 'Test food order creation, item pricing calculation, and status progression.' }
    ],
    deployment: {
      platform: 'Render / Vercel + MongoDB Atlas',
      envVars: ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'],
      steps: ['Deploy Express backend with Socket.io on Render.', 'Deploy React SPA on Vercel.', 'Provision MongoDB Atlas cluster.'],
      dockerfileSnippet: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 5000\nCMD ["node", "src/server.js"]',
      nginxSnippet: 'server {\n  listen 80;\n  server_name api.fooddelivery.com;\n  location / {\n    proxy_pass http://localhost:5000;\n  }\n}'
    }
  };
}

function generateHospitalBlueprint(name, desc, pType, pStack) {
  return {
    overview: `${name} is a secure, HIPAA-compliant ${pType} designed for hospital administration, doctor scheduling, patient electronic health records (EHR), and appointment booking.`,
    problemStatement: `Resolves patient waiting times, record fragmentation, and appointment scheduling conflicts by establishing a centralized healthcare administration platform.`,
    assumptions: [
      `Accessible to hospital receptionists, doctors, and registered patients.`,
      `Patient health records are encrypted at rest adhering to medical compliance standards.`,
      `Doctor slot availability updates automatically upon appointment booking.`
    ],
    functionalRequirements: [
      `Patient account registration, medical history profile, and emergency contact storage.`,
      `Doctor directory search by specialization, availability slots, and consultation fee.`,
      `Appointment booking engine with status management (Pending, Confirmed, Completed, Cancelled).`,
      `Doctor portal to record diagnosis, upload digital prescriptions, and view patient history.`
    ],
    nonFunctionalRequirements: [
      `Data encryption at rest using AES-256 for medical record fields.`,
      `Strict Role-Based Access Control (RBAC) ensuring doctors access only assigned patient files.`,
      `High-availability database uptime (99.9%) for emergency room record retrieval.`
    ],
    userRoles: [
      { role: 'Patient', description: 'Searches doctor directory, books appointments, views prescriptions.', permissions: ['view_doctors', 'book_appointment', 'view_my_records'] },
      { role: 'Doctor / Physician', description: 'Manages consultation schedule, views patient medical history, issues prescriptions.', permissions: ['manage_schedule', 'view_patient_ehr', 'write_prescription'] },
      { role: 'Hospital Administrator', description: 'Manages staff accounts, department listings, and hospital billing.', permissions: ['manage_staff', 'manage_departments', 'view_billing'] }
    ],
    features: [
      `Doctor Slot Scheduling & Online Appointment Booking`,
      `Patient Electronic Health Record (EHR) & Prescription Vault`,
      `Role-Based Healthcare Security & Patient Privacy Controls`,
      `Departmental Billing & Consultation Invoice Engine`
    ],
    missingRequirements: [
      `Insurance provider integration unspecified; assumed self-pay consultation model.`,
      `Lab test report system unspecified; assumed external lab attachment upload.`
    ],
    techStack: [
      { category: 'Frontend', technology: 'React 18 & Tailwind CSS', purpose: 'Patient Portal & Doctor Dashboard', reason: 'Clean component encapsulation for complex medical record forms.' },
      { category: 'Backend Server', technology: 'Node.js & Express.js', purpose: 'RESTful API & RBAC Security Layer', reason: 'High throughput async I/O with audit logging middleware.' },
      { category: 'Database', technology: 'MongoDB & Mongoose', purpose: 'Document Store for Patients & EHR', reason: 'Schema flexibility accommodating diverse medical record structures.' },
      { category: 'Security Stack', technology: 'Bcrypt & AES-256 Encryption', purpose: 'Field-Level Health Data Protection', reason: 'Encrypted patient records preventing unauthorized exposure.' }
    ],
    architecture: {
      summary: 'HIPAA-Compliant 3-Tier Architecture featuring encrypted Mongoose document models and RBAC authorization guards.',
      pattern: 'Express MVC REST API + RBAC Middleware + React SPA',
      dataFlow: 'Patient App -> Express Route -> Auth & RBAC Middleware -> Doctor/Appointment Controller -> Encrypted Mongoose -> MongoDB',
      nodes: [
        { id: 'client', label: 'Patient & Doctor Portal', type: 'user', description: 'React SPA Interface' },
        { id: 'gateway', label: 'Express API & RBAC Guard', type: 'api', description: 'JWT Authentication & Role Check' },
        { id: 'backend', label: 'Medical & Appointment Controllers', type: 'backend', description: 'EHR business logic & Scheduling' },
        { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Patients, Doctors, Appointments & MedicalRecords' }
      ],
      connections: [
        { from: 'client', to: 'gateway', label: 'HTTPS REST API' },
        { from: 'gateway', to: 'backend', label: 'Role-Guarded Requests' },
        { from: 'backend', to: 'database', label: 'Encrypted Queries' }
      ]
    },
    entities: [
      {
        name: 'User',
        description: 'System user profile (Patient, Doctor, Admin).',
        primaryKey: '_id (ObjectId)',
        foreignKeys: [],
        relationships: ['Appointment (1:N)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'name', type: 'String', required: true, description: 'Full name' },
          { name: 'email', type: 'String', required: true, description: 'Email address' },
          { name: 'role', type: 'String', required: true, description: 'Patient | Doctor | Admin' }
        ]
      },
      {
        name: 'Doctor',
        description: 'Doctor profile detailing medical specialty, qualifications, and consultation fee.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['user -> User._id'],
        relationships: ['Appointment (1:N)', 'Prescription (1:N)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'user', type: 'ObjectId', required: true, description: 'FK to User' },
          { name: 'specialization', type: 'String', required: true, description: 'Cardiology | Neurology | Pediatrics' },
          { name: 'consultationFee', type: 'Number', required: true, description: 'Fee per appointment' }
        ]
      },
      {
        name: 'Appointment',
        description: 'Medical appointment booking record between patient and doctor.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['patient -> User._id', 'doctor -> Doctor._id'],
        relationships: ['User (N:1)', 'Doctor (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'patient', type: 'ObjectId', required: true, description: 'FK to Patient User' },
          { name: 'doctor', type: 'ObjectId', required: true, description: 'FK to Doctor' },
          { name: 'appointmentDate', type: 'Date', required: true, description: 'Scheduled date & time' },
          { name: 'status', type: 'String', required: true, description: 'Pending | Confirmed | Completed | Cancelled' }
        ]
      },
      {
        name: 'MedicalRecord',
        description: 'Patient medical record containing clinical diagnosis, notes, and prescriptions.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['patient -> User._id', 'doctor -> Doctor._id', 'appointment -> Appointment._id'],
        relationships: ['User (N:1)', 'Doctor (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'patient', type: 'ObjectId', required: true, description: 'FK to Patient User' },
          { name: 'doctor', type: 'ObjectId', required: true, description: 'FK to Doctor' },
          { name: 'diagnosis', type: 'String', required: true, description: 'Clinical diagnosis text' },
          { name: 'prescription', type: 'String', required: true, description: 'Prescribed medication & dosage' }
        ]
      }
    ],
    relationships: [
      { from: 'Doctor', to: 'Appointment', type: '1:N', description: 'Doctor receives multiple appointment bookings.' },
      { from: 'Patient', to: 'Appointment', type: '1:N', description: 'Patient schedules multiple doctor appointments.' },
      { from: 'Patient', to: 'MedicalRecord', type: '1:N', description: 'Patient accumulates medical history records.' }
    ],
    erDiagramText: `erDiagram\n    DOCTOR ||--o{ APPOINTMENT : conducts\n    USER ||--o{ APPOINTMENT : books\n    USER ||--o{ MEDICALRECORD : owns`,
    apiEndpoints: [
      { method: 'GET', endpoint: '/api/v1/doctors', description: 'Search doctor directory by specialty and availability.', authentication: 'Public', headers: 'None', queryParams: 'specialization=Cardiology', requestBody: 'None', response: '[{"_id":"...","name":"Dr. Smith","specialization":"Cardiology"}]', possibleErrors: ['500 Internal Error'] },
      { method: 'POST', endpoint: '/api/v1/appointments', description: 'Book a medical appointment slot with a doctor.', authentication: 'Required (Patient JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: '{"doctorId":"...","appointmentDate":"2026-10-15T10:00:00Z","reason":"Routine Checkup"}', response: '{"_id":"...","status":"Pending"}', possibleErrors: ['400 Bad Request', '401 Unauthorized'] },
      { method: 'GET', endpoint: '/api/v1/patients/:id/records', description: 'Retrieve encrypted patient EHR history.', authentication: 'Required (Doctor/Patient JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: 'None', response: '[{"diagnosis":"Hypertension","prescription":"Lisinopril 10mg"}]', possibleErrors: ['403 Forbidden', '404 Not Found'] },
      { method: 'POST', endpoint: '/api/v1/prescriptions', description: 'Issue digital prescription for an appointment.', authentication: 'Required (Doctor JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: '{"appointmentId":"...","medications":["Amoxicillin"],"notes":"Take twice daily"}', response: '{"_id":"...","prescriptionId":"..."}', possibleErrors: ['403 Forbidden'] }
    ],
    frontend: {
      pages: [
        { name: 'Doctor Directory & Search', route: '/', purpose: 'Filter doctors by medical specialty and fee.', components: ['DoctorCard', 'SpecialtyFilter', 'BookingModal'], apiCalls: ['GET /api/v1/doctors'] },
        { name: 'Patient Appointments Page', route: '/appointments', purpose: 'View upcoming and past hospital appointments.', components: ['AppointmentList', 'StatusBadge', 'CancelButton'], apiCalls: ['POST /api/v1/appointments'] },
        { name: 'EHR Medical Vault', route: '/medical-records', purpose: 'Inspect digital prescriptions and diagnosis history.', components: ['RecordTimeline', 'PrescriptionCard'], apiCalls: ['GET /api/v1/patients/:id/records'] }
      ],
      componentStructure: [
        { name: 'DoctorCard', type: 'UI Component', purpose: 'Renders doctor profile picture, specialization tag, fee, and book button.' },
        { name: 'BookingModal', type: 'Form Modal', purpose: 'Captures date, time slot, and chief complaint for appointment booking.' }
      ]
    },
    folderStructure: {
      frontend: `frontend/src/\n├── assets/          # Medical icons & logos\n├── components/      # DoctorCard, BookingModal, RecordTimeline\n├── context/         # AuthContext\n├── pages/           # DoctorDirectory, Appointments, MedicalRecords\n└── services/        # API client`,
      backend: `backend/src/\n├── config/          # DB connection\n├── controllers/     # doctorController, appointmentController, ehrController\n├── middleware/      # authMiddleware, rbacMiddleware\n├── models/          # User, Doctor, Appointment, MedicalRecord\n└── routes/          # doctorRoutes, appointmentRoutes`
    },
    security: [
      { item: 'Field-Level Medical Record Encryption', recommendation: 'Encrypt sensitive diagnosis and prescription fields at rest.', relevance: 'Protects patient EHR data confidentiality.' },
      { item: 'Role-Based Access Control (RBAC)', recommendation: 'Enforce middleware checking user role (Patient vs Doctor vs Admin) before API execution.', relevance: 'Prevents patients from viewing peer medical records.' }
    ],
    roadmapPhases: buildStandardRoadmapPhases(name, 'Hospital Management System', 'Doctor & Appointment API', 'Doctor Directory & EHR UI'),
    testing: [
      { type: 'Integration Testing', tool: 'Supertest', strategy: 'Test appointment slot booking concurrency and patient record authorization.' }
    ],
    deployment: {
      platform: 'AWS ECS / Render + MongoDB Atlas',
      envVars: ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'],
      steps: ['Deploy Express backend with RBAC middleware.', 'Deploy React SPA patient portal.', 'Configure MongoDB Atlas cluster with encryption at rest.'],
      dockerfileSnippet: 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 5000\nCMD ["node", "src/server.js"]',
      nginxSnippet: 'server {\n  listen 80;\n  server_name api.hospitalcare.com;\n  location / {\n    proxy_pass http://localhost:5000;\n  }\n}'
    }
  };
}

function generateEcommerceBlueprint(name, desc, pType, pStack) {
  return {
    overview: `${name} is a scalable ${pType} designed for online retail, product catalog search, shopping cart management, and Stripe payment processing.`,
    problemStatement: `Addresses product discoverability, cart abandonment, and payment security for online retail customers.`,
    assumptions: [`Products are categorized with stock counts.`, `Payments process via Stripe checkout.`],
    functionalRequirements: [
      `Product catalog search, category filtering, and item detail view.`,
      `Persistent shopping cart with item quantity updates and total price calculation.`,
      `Stripe checkout integration for secure credit card payment processing.`
    ],
    nonFunctionalRequirements: [`Sub-200ms catalog search latency.`, `PCI-DSS compliant payment processing via Stripe checkout.`],
    userRoles: [
      { role: 'Buyer', description: 'Browses products, adds items to cart, completes checkout.', permissions: ['browse_products', 'checkout'] },
      { role: 'Store Admin', description: 'Manages product listings, categories, and inventory stock.', permissions: ['manage_products', 'view_orders'] }
    ],
    features: [`Product Catalog & Category Filter`, `Persistent Shopping Cart & Stripe Payment`, `Order History & Inventory Management`],
    missingRequirements: [`Shipping carrier integration unspecified.`],
    techStack: [
      { category: 'Frontend', technology: 'React 18 & Tailwind CSS', purpose: 'E-commerce Storefront', reason: 'Responsive cart and product grid rendering.' },
      { category: 'Backend', technology: 'Node.js & Express.js', purpose: 'Store API & Stripe Webhook Handler', reason: 'Asynchronous payment processing.' },
      { category: 'Database', technology: 'MongoDB & Mongoose', purpose: 'Product & Order Store', reason: 'Flexible document schema for varied product attributes.' }
    ],
    architecture: {
      summary: '3-Tier E-commerce Architecture with Stripe payment gateway integration.',
      pattern: 'Express MVC REST + React SPA + Stripe API',
      dataFlow: 'Client -> Axios -> Express API -> Cart/Product Controller -> MongoDB & Stripe API',
      nodes: [
        { id: 'client', label: 'React Storefront SPA', type: 'user', description: 'Product Browsing & Cart' },
        { id: 'backend', label: 'Express Store API', type: 'backend', description: 'Catalog & Stripe Controller' },
        { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Products, Users & Orders' }
      ],
      connections: [
        { from: 'client', to: 'backend', label: 'HTTPS API' },
        { from: 'backend', to: 'database', label: 'Mongoose ODM' }
      ]
    },
    entities: [
      {
        name: 'Product',
        description: 'Retail product listing with price, stock, and category.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: [],
        relationships: ['Order (1:N)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'title', type: 'String', required: true, description: 'Product name' },
          { name: 'price', type: 'Number', required: true, description: 'Price' },
          { name: 'stock', type: 'Number', required: true, description: 'Inventory count' }
        ]
      },
      {
        name: 'Order',
        description: 'Completed purchase transaction.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['user -> User._id'],
        relationships: ['User (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'user', type: 'ObjectId', required: true, description: 'FK to User' },
          { name: 'totalPrice', type: 'Number', required: true, description: 'Order total' }
        ]
      }
    ],
    relationships: [{ from: 'User', to: 'Order', type: '1:N', description: 'User places orders.' }],
    erDiagramText: `erDiagram\n    USER ||--o{ ORDER : places`,
    apiEndpoints: [
      { method: 'GET', endpoint: '/api/v1/products', description: 'Search catalog.', authentication: 'Public', headers: 'None', queryParams: 'search=shoes', requestBody: 'None', response: '[]', possibleErrors: ['500 Internal Error'] },
      { method: 'POST', endpoint: '/api/v1/checkout', description: 'Process payment.', authentication: 'Required (JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: '{}', response: '{}', possibleErrors: ['400 Bad Request'] }
    ],
    frontend: {
      pages: [
        { name: 'Storefront Catalog', route: '/', purpose: 'Product grid.', components: ['ProductCard', 'CartDrawer'], apiCalls: ['GET /api/v1/products'] }
      ],
      componentStructure: [{ name: 'ProductCard', type: 'UI', purpose: 'Product display.' }]
    },
    folderStructure: { frontend: 'src/components/', backend: 'src/controllers/' },
    security: [{ item: 'Stripe Signature Check', recommendation: 'Verify webhooks.', relevance: 'Prevents fake order creation.' }],
    roadmapPhases: buildStandardRoadmapPhases(name, 'E-Commerce Platform', 'Product & Cart API', 'Storefront UI'),
    testing: [{ type: 'Integration', tool: 'Supertest', strategy: 'Test cart checkout.' }],
    deployment: { platform: 'Vercel + Render', envVars: ['STRIPE_KEY'], steps: ['Deploy.'], dockerfileSnippet: 'FROM node:18-alpine', nginxSnippet: 'server {}' }
  };
}

function generateEducationBlueprint(name, desc, pType, pStack) {
  return {
    overview: `${name} is a modern ${pType} designed for course enrollment, video lesson streaming, student progress tracking, and quiz evaluation.`,
    problemStatement: `Provides structured online learning and student assessment capabilities.`,
    assumptions: [`Instructors publish course modules.`, `Students enroll and complete quizzes.`],
    functionalRequirements: [
      `Course directory search and video module viewing.`,
      `Student enrollment tracking and course completion certificates.`,
      `Interactive quiz submission and score evaluation.`
    ],
    nonFunctionalRequirements: [`Fast video streaming metadata load.`, `Secure student grade records.`],
    userRoles: [
      { role: 'Student', description: 'Enrolls in courses, watches lessons, completes quizzes.', permissions: ['enroll_course', 'take_quiz'] },
      { role: 'Instructor', description: 'Creates course curriculum, uploads lessons, evaluates assignments.', permissions: ['create_course', 'manage_lessons'] }
    ],
    features: [`Course Directory & Video Lessons`, `Student Enrollment & Progress Tracker`, `Quiz Evaluation & Certificate Generation`],
    missingRequirements: [`Video hosting vendor unspecified; assumed AWS S3 / Cloudinary.`],
    techStack: [
      { category: 'Frontend', technology: 'React 18 & Tailwind CSS', purpose: 'Learning Portal UI', reason: 'Interactive video course dashboard.' },
      { category: 'Backend', technology: 'Node.js & Express.js', purpose: 'LMS REST API', reason: 'High throughput course streaming metadata.' },
      { category: 'Database', technology: 'MongoDB & Mongoose', purpose: 'Courses & Quizzes Store', reason: 'Document store for nested course modules.' }
    ],
    architecture: {
      summary: '3-Tier LMS Architecture supporting course streaming and quiz submission.',
      pattern: 'Express MVC REST + React SPA',
      dataFlow: 'Student -> React SPA -> Express API -> Mongoose -> MongoDB',
      nodes: [
        { id: 'client', label: 'Student React SPA', type: 'user', description: 'Course & Quiz Viewer' },
        { id: 'backend', label: 'Express LMS API', type: 'backend', description: 'Course & Quiz Controller' },
        { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Courses, Students & Enrolled' }
      ],
      connections: [
        { from: 'client', to: 'backend', label: 'HTTPS API' },
        { from: 'backend', to: 'database', label: 'Mongoose ODM' }
      ]
    },
    entities: [
      {
        name: 'Course',
        description: 'Educational course module.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['instructor -> User._id'],
        relationships: ['Enrollment (1:N)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'title', type: 'String', required: true, description: 'Course title' },
          { name: 'category', type: 'String', required: true, description: 'Category' }
        ]
      },
      {
        name: 'Enrollment',
        description: 'Student course enrollment record.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['student -> User._id', 'course -> Course._id'],
        relationships: ['User (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'student', type: 'ObjectId', required: true, description: 'FK to Student User' },
          { name: 'progressPercent', type: 'Number', required: true, description: 'Progress' }
        ]
      }
    ],
    relationships: [{ from: 'Course', to: 'Enrollment', type: '1:N', description: 'Course has enrollments.' }],
    erDiagramText: `erDiagram\n    COURSE ||--o{ ENROLLMENT : tracks`,
    apiEndpoints: [
      { method: 'GET', endpoint: '/api/v1/courses', description: 'Search courses.', authentication: 'Public', headers: 'None', queryParams: 'category=webdev', requestBody: 'None', response: '[]', possibleErrors: ['500 Internal Error'] },
      { method: 'POST', endpoint: '/api/v1/courses/:id/enroll', description: 'Enroll student.', authentication: 'Required (JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: '{}', response: '{}', possibleErrors: ['400 Bad Request'] }
    ],
    frontend: {
      pages: [
        { name: 'Course Catalog', route: '/', purpose: 'Browse courses.', components: ['CourseCard'], apiCalls: ['GET /api/v1/courses'] }
      ],
      componentStructure: [{ name: 'CourseCard', type: 'UI', purpose: 'Course preview.' }]
    },
    folderStructure: { frontend: 'src/components/', backend: 'src/controllers/' },
    security: [{ item: 'JWT Auth', recommendation: 'Secure student records.', relevance: 'Protects grades.' }],
    roadmapPhases: buildStandardRoadmapPhases(name, 'Learning Management System', 'Course & Quiz API', 'Student Portal UI'),
    testing: [{ type: 'Integration', tool: 'Supertest', strategy: 'Test enrollment.' }],
    deployment: { platform: 'Render + MongoDB Atlas', envVars: ['PORT'], steps: ['Deploy.'], dockerfileSnippet: 'FROM node:18-alpine', nginxSnippet: 'server {}' }
  };
}

function generateGenericDynamicBlueprint(name, desc, pType, pStack) {
  // Extract key words from description
  const words = desc.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3 && !['built', 'want', 'build', 'system', 'application', 'where', 'users', 'should', 'their', 'with', 'from', 'that', 'this', 'have', 'need'].includes(w.toLowerCase()));
  const entityA = words[0] ? capitalize(words[0]) : 'Item';
  const entityB = words[1] ? capitalize(words[1]) : 'Activity';

  return {
    overview: `${name} is a custom-engineered ${pType} designed to address specific requirements: "${desc.slice(0, 180)}...". It organizes domain logic into a structured REST API and document database.`,
    problemStatement: `Provides domain automation, user data isolation, and operational workflow tracking for ${name}.`,
    assumptions: [`Accessible via modern web browsers.`, `Stateless session authorization using JWT bearer tokens.`],
    functionalRequirements: [
      `User registration, authentication, and security profile management.`,
      `CRUD lifecycle management for ${entityA} and ${entityB} resources.`,
      `Interactive filtering, searching, and dashboard reporting for ${name}.`
    ],
    nonFunctionalRequirements: [`REST API request latency < 200ms.`, `Password salting using bcrypt with 10 salt rounds.`],
    userRoles: [
      { role: 'Standard User', description: 'Manages personal domain resources and views dashboards.', permissions: ['read_data', 'create_record'] },
      { role: 'Administrator', description: 'Supervises platform settings and user management.', permissions: ['manage_all'] }
    ],
    features: [`${entityA} & ${entityB} Management Engine`, `Interactive Telemetry Dashboard`, `Role-Based Data Isolation`],
    missingRequirements: [`External third-party integration vendors unspecified.`],
    techStack: [
      { category: 'Frontend', technology: 'React 18 & Tailwind CSS', purpose: 'Single Page Application UI', reason: 'Component reusability and Virtual DOM speed.' },
      { category: 'Backend', technology: 'Node.js & Express.js', purpose: 'RESTful API Server', reason: 'Asynchronous event-driven I/O.' },
      { category: 'Database', technology: 'MongoDB & Mongoose', purpose: 'NoSQL Document Store', reason: 'Dynamic document schema flexibility.' }
    ],
    architecture: {
      summary: `Clean 3-tier architecture for ${name}.`,
      pattern: 'Express MVC REST + React SPA',
      dataFlow: 'React Client -> Express API -> Mongoose -> MongoDB',
      nodes: [
        { id: 'client', label: 'React SPA Client', type: 'user', description: 'User Interface' },
        { id: 'backend', label: 'Express REST Server', type: 'backend', description: 'Business Logic' },
        { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Document Collections' }
      ],
      connections: [
        { from: 'client', to: 'backend', label: 'HTTPS REST API' },
        { from: 'backend', to: 'database', label: 'Mongoose Queries' }
      ]
    },
    entities: [
      {
        name: 'User',
        description: 'User identity document.',
        primaryKey: '_id (ObjectId)',
        foreignKeys: [],
        relationships: [`${entityA} (1:N)`],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'name', type: 'String', required: true, description: 'Name' },
          { name: 'email', type: 'String', required: true, description: 'Email' }
        ]
      },
      {
        name: entityA,
        description: `Primary domain document for ${entityA}.`,
        primaryKey: '_id (ObjectId)',
        foreignKeys: ['user -> User._id'],
        relationships: ['User (N:1)'],
        fields: [
          { name: '_id', type: 'ObjectId', required: true, description: 'Primary key' },
          { name: 'user', type: 'ObjectId', required: true, description: 'FK to User' },
          { name: 'title', type: 'String', required: true, description: 'Title/Name' }
        ]
      }
    ],
    relationships: [{ from: 'User', to: entityA, type: '1:N', description: `User owns multiple ${entityA} documents.` }],
    erDiagramText: `erDiagram\n    USER ||--o{ ${entityA.toUpperCase()} : owns`,
    apiEndpoints: [
      { method: 'GET', endpoint: `/api/v1/${entityA.toLowerCase()}s`, description: `Fetch user ${entityA.toLowerCase()}s.`, authentication: 'Required (JWT)', headers: 'Authorization: Bearer <token>', queryParams: 'None', requestBody: 'None', response: '[]', possibleErrors: ['401 Unauthorized'] }
    ],
    frontend: {
      pages: [{ name: 'Dashboard', route: '/dashboard', purpose: 'Overview.', components: ['DataGrid'], apiCalls: [`GET /api/v1/${entityA.toLowerCase()}s`] }],
      componentStructure: [{ name: 'DataGrid', type: 'UI Component', purpose: 'Data display.' }]
    },
    folderStructure: { frontend: 'src/components/', backend: 'src/controllers/' },
    security: [{ item: 'JWT Auth', recommendation: 'Bearer token auth.', relevance: 'Secures user APIs.' }],
    roadmapPhases: buildStandardRoadmapPhases(name, `${name} Platform`, `${entityA} API`, `${entityA} UI`),
    testing: [{ type: 'Unit', tool: 'Jest', strategy: 'Test controller handlers.' }],
    deployment: { platform: 'Render + MongoDB Atlas', envVars: ['PORT'], steps: ['Deploy.'], dockerfileSnippet: 'FROM node:18-alpine', nginxSnippet: 'server {}' }
  };
}

function capitalize(str) {
  if (!str) return 'Resource';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function buildStandardRoadmapPhases(projName, sysName, apiName, uiName) {
  return [
    {
      phaseNumber: 1,
      phaseName: 'Phase 1: Environment Setup, Repo Architecture, and Base Config',
      summary: `Initialize workspace and Express backend for ${projName}.`,
      tasks: [
        { taskId: '1.1', title: 'Workspace Scaffolding & Git Init', description: `Create monorepo structure for ${projName}.`, whatToBuild: 'Backend & frontend subfolders.', files: ['.gitignore', 'package.json'], dependencies: 'Node.js v18+', expectedResult: 'Clean workspace setup.', status: 'Completed' },
        { taskId: '1.2', title: 'Express App Initialization', description: 'Mount CORS, JSON parser, and health route.', whatToBuild: 'backend/src/app.js.', files: ['backend/src/app.js'], dependencies: 'express', expectedResult: 'Express boots on PORT 5000.', status: 'Completed' }
      ]
    },
    {
      phaseNumber: 2,
      phaseName: 'Phase 2: Database Layer & Domain Models',
      summary: `Implement Mongoose models for ${projName}.`,
      tasks: [
        { taskId: '2.1', title: 'User & Identity Model', description: 'Create User schema with bcrypt password hashing.', whatToBuild: 'backend/src/models/User.js.', files: ['backend/src/models/User.js'], dependencies: 'mongoose', expectedResult: 'User model compiled.', status: 'Completed' },
        { taskId: '2.2', title: `${sysName} Domain Models`, description: `Create domain schemas for ${projName}.`, whatToBuild: 'Mongoose models.', files: ['backend/src/models/Project.js'], dependencies: 'mongoose', expectedResult: 'Schemas reference User ObjectId.', status: 'Completed' }
      ]
    },
    {
      phaseNumber: 3,
      phaseName: 'Phase 3: Core Backend Business Logic & Auth Middleware',
      summary: 'Set up JWT authentication middleware and async error handlers.',
      tasks: [
        { taskId: '3.1', title: 'JWT Auth Middleware', description: 'Protect routes with Bearer token validation.', whatToBuild: 'backend/src/middleware/authMiddleware.js.', files: ['backend/src/middleware/authMiddleware.js'], dependencies: 'jsonwebtoken', expectedResult: 'Auth middleware populates req.user.', status: 'Completed' }
      ]
    },
    {
      phaseNumber: 4,
      phaseName: 'Phase 4: API Routes & Controllers',
      summary: `Implement REST API endpoints for ${apiName}.`,
      tasks: [
        { taskId: '4.1', title: `${apiName} Controllers`, description: `Implement CRUD routes for ${sysName}.`, whatToBuild: 'Express route handlers.', files: ['backend/src/controllers/projectController.js'], dependencies: 'express', expectedResult: 'APIs respond with JSON status 200/201.', status: 'Completed' }
      ]
    },
    {
      phaseNumber: 5,
      phaseName: 'Phase 5: Frontend Framework Initialization',
      summary: 'Initialize Vite React SPA and Axios API client.',
      tasks: [
        { taskId: '5.1', title: 'Vite React & Tailwind Setup', description: 'Scaffold React app with Tailwind CSS.', whatToBuild: 'frontend/src/App.jsx.', files: ['frontend/src/App.jsx'], dependencies: 'vite', expectedResult: 'React SPA renders.', status: 'Completed' }
      ]
    },
    {
      phaseNumber: 6,
      phaseName: 'Phase 6: Core Feature Components & UI Implementation',
      summary: `Build ${uiName} views and interactive visual diagrams.`,
      tasks: [
        { taskId: '6.1', title: `${uiName} Implementation`, description: `Build pages and component views for ${projName}.`, whatToBuild: 'React components.', files: ['frontend/src/pages/ProjectDetails.jsx'], dependencies: 'react', expectedResult: 'Blueprint UI renders 13 specification sections.', status: 'Completed' }
      ]
    },
    {
      phaseNumber: 7,
      phaseName: 'Phase 7: Testing Strategy',
      summary: 'Write integration test cases for API routes and UI components.',
      tasks: [
        { taskId: '7.1', title: 'API Integration Testing', description: 'Test API routes with Supertest.', whatToBuild: 'Jest test suite.', files: ['backend/tests/api.test.js'], dependencies: 'jest', expectedResult: 'All tests pass.', status: 'Not Started' }
      ]
    },
    {
      phaseNumber: 8,
      phaseName: 'Phase 8: Production Deployment',
      summary: 'Containerize backend and configure deployment pipeline.',
      tasks: [
        { taskId: '8.1', title: 'Docker Containerization', description: 'Create multi-stage Dockerfile.', whatToBuild: 'Dockerfile.', files: ['backend/Dockerfile'], dependencies: 'Docker', expectedResult: 'Docker image builds.', status: 'Not Started' }
      ]
    }
  ];
}
