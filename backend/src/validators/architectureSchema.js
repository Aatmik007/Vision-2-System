import { z } from 'zod';

/**
 * Zod validation schema for individual architectural entities & models
 */
export const EntityFieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.string().default('String'),
  required: z.boolean().default(false),
  description: z.string().default(''),
  validation: z.string().optional().default('')
});

export const EntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  description: z.string().default(''),
  primaryKey: z.string().default('_id (ObjectId)'),
  foreignKeys: z.array(z.union([z.string(), z.record(z.any())])).default([]),
  relationships: z.array(z.union([z.string(), z.record(z.any())])).default([]),
  fields: z.array(EntityFieldSchema).default([])
});

/**
 * REST API Endpoint Schema
 */
export const ApiEndpointSchema = z.object({
  method: z.string().default('GET'),
  endpoint: z.string().min(1, 'Endpoint route is required'),
  description: z.string().default(''),
  authentication: z.string().default('Public'),
  headers: z.union([z.string(), z.record(z.any())]).default('Content-Type: application/json'),
  queryParams: z.union([z.string(), z.record(z.any()), z.array(z.any())]).default('None'),
  requestBody: z.union([z.string(), z.record(z.any())]).default('None'),
  response: z.union([z.string(), z.record(z.any())]).default('{}'),
  statusCodes: z.array(z.union([z.string(), z.number()])).optional().default(['200 OK', '400 Bad Request', '500 Internal Error']),
  possibleErrors: z.array(z.string()).default(['400 Bad Request', '500 Internal Server Error'])
});

/**
 * Architecture Visualizer Node and Edge Schema
 */
export const ArchitectureNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  label: z.string().min(1, 'Node label is required'),
  type: z.enum(['user', 'frontend', 'api', 'backend', 'service', 'database', 'external']).or(z.string()).default('service'),
  description: z.string().default(''),
  module: z.string().optional().default(''),
  filePaths: z.array(z.string()).optional().default([]),
  endpoints: z.array(z.string()).optional().default([])
});

export const ArchitectureConnectionSchema = z.object({
  from: z.string().min(1, 'Connection origin required'),
  to: z.string().min(1, 'Connection destination required'),
  label: z.string().default('Data Flow'),
  type: z.string().optional().default('default')
});

export const ArchitectureTopologySchema = z.object({
  summary: z.string().default('3-Tier Full-Stack Architecture'),
  pattern: z.string().default('Express REST API + React SPA'),
  dataFlow: z.string().default('Client -> Express API -> Controller / Service -> Database'),
  nodes: z.array(ArchitectureNodeSchema).default([]),
  connections: z.array(ArchitectureConnectionSchema).default([])
});

/**
 * System Module Schema (Frontend & Backend breakdown)
 */
export const SystemModuleSchema = z.object({
  name: z.string().min(1, 'Module name is required'),
  type: z.enum(['frontend', 'backend', 'shared', 'database', 'service', 'api']).or(z.string()).default('backend'),
  description: z.string().default(''),
  responsibilities: z.array(z.string()).default([]),
  filePaths: z.array(z.string()).default([])
});

/**
 * Error Handling Schema
 */
export const ErrorHandlingItemSchema = z.object({
  code: z.union([z.string(), z.number()]).default('500'),
  scenario: z.string().default('Internal error'),
  responseFormat: z.string().default('{ "success": false, "message": "Error details" }')
});

export const DEFAULT_ERROR_HANDLING = {
  strategy: 'Centralized async error middleware with standardized JSON responses.',
  httpCodes: [
    { code: '400', scenario: 'Invalid input / validation error', responseFormat: '{ "success": false, "message": "Validation failed", "errors": [] }' },
    { code: '401', scenario: 'Missing or expired JWT bearer token', responseFormat: '{ "success": false, "message": "Unauthorized" }' },
    { code: '403', scenario: 'Insufficient permissions for role', responseFormat: '{ "success": false, "message": "Forbidden access" }' },
    { code: '404', scenario: 'Target resource not found', responseFormat: '{ "success": false, "message": "Resource not found" }' },
    { code: '429', scenario: 'Rate limit threshold exceeded', responseFormat: '{ "success": false, "message": "Too many requests. Please try again later." }' },
    { code: '500', scenario: 'Unhandled exception / database failure', responseFormat: '{ "success": false, "message": "Internal server error" }' }
  ],
  logging: 'Structured console logging in development; Winston / Pino error stream in production.',
  retries: 'Exponential backoff with jitter on transient database and third-party network failures.'
};

export const ErrorHandlingSchema = z.object({
  strategy: z.string().default(DEFAULT_ERROR_HANDLING.strategy),
  httpCodes: z.array(ErrorHandlingItemSchema).default(DEFAULT_ERROR_HANDLING.httpCodes),
  logging: z.string().default(DEFAULT_ERROR_HANDLING.logging),
  retries: z.string().default(DEFAULT_ERROR_HANDLING.retries)
});


/**
 * Roadmap Task and Phase Schema
 */
export const RoadmapTaskSchema = z.object({
  taskId: z.string().min(1, 'Task ID required'),
  title: z.string().min(1, 'Task title required'),
  description: z.string().default(''),
  whatToBuild: z.string().default(''),
  files: z.array(z.string()).default([]),
  dependencies: z.string().default('None'),
  expectedResult: z.string().default('Functional component or route.'),
  status: z.enum(['Completed', 'In Progress', 'Not Started']).or(z.string()).default('Not Started')
});

export const RoadmapPhaseSchema = z.object({
  phaseNumber: z.number().default(1),
  phaseName: z.string().min(1, 'Phase name required'),
  summary: z.string().default(''),
  tasks: z.array(RoadmapTaskSchema).default([])
});

/**
 * Master Enterprise Architecture Blueprint Schema
 */
export const ArchitectureBlueprintSchema = z.object({
  projectDetails: z.object({
    name: z.string().optional().default('System Project'),
    projectType: z.string().optional().default('Web Application'),
    preferredStack: z.string().optional().default('MERN'),
    targetAudience: z.union([z.string(), z.array(z.string())]).optional().default('End users and business operators.'),
    summary: z.string().optional().default('')
  }).optional().default({}),
  overview: z.string().min(10, 'Overview is required and must be informative'),
  problemStatement: z.string().optional().default('Streamlines operations, data integrity, and user interactions.'),
  assumptions: z.array(z.string()).default([]),
  functionalRequirements: z.array(z.string()).default([]),
  nonFunctionalRequirements: z.array(z.string()).default([]),
  userRoles: z.array(z.object({
    role: z.string(),
    description: z.string().default(''),
    permissions: z.array(z.string()).default([])
  })).default([]),
  features: z.array(z.string()).default([]),
  missingRequirements: z.array(z.string()).default([]),
  techStack: z.array(z.object({
    category: z.string(),
    technology: z.string(),
    purpose: z.string().default(''),
    reason: z.string().default('')
  })).default([]),
  modules: z.array(SystemModuleSchema).default([]),
  architecture: ArchitectureTopologySchema.default({}),
  entities: z.array(EntitySchema).default([]),
  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    type: z.string().default('1:N'),
    description: z.string().default('')
  })).default([]),
  erDiagramText: z.string().default(''),
  apiEndpoints: z.array(ApiEndpointSchema).default([]),
  frontend: z.object({
    pages: z.array(z.object({
      name: z.string(),
      route: z.string(),
      purpose: z.string().default(''),
      components: z.array(z.string()).default([]),
      apiCalls: z.array(z.string()).default([])
    })).default([]),
    componentStructure: z.array(z.object({
      name: z.string(),
      type: z.string().default('Component'),
      purpose: z.string().default('')
    })).default([])
  }).default({}),
  folderStructure: z.union([
    z.object({
      frontend: z.union([z.string(), z.array(z.any()), z.record(z.any())]).default('frontend/src/'),
      backend: z.union([z.string(), z.array(z.any()), z.record(z.any())]).default('backend/src/'),
      fileManifest: z.array(z.object({
        path: z.string(),
        description: z.string().default(''),
        type: z.string().default('source')
      })).optional().default([])
    }),
    z.record(z.any())
  ]).default({ frontend: 'frontend/src/', backend: 'backend/src/' }),
  security: z.array(z.object({
    item: z.string(),
    recommendation: z.string(),
    relevance: z.string().default('Critical')
  })).default([]),
  errorHandling: ErrorHandlingSchema.default(DEFAULT_ERROR_HANDLING),
  roadmapPhases: z.array(RoadmapPhaseSchema).default([]),
  testing: z.array(z.object({
    type: z.string(),
    tool: z.string(),
    strategy: z.string().default('')
  })).default([]),
  deployment: z.object({
    platform: z.string().default('Render / Vercel + MongoDB Atlas'),
    envVars: z.array(z.string()).default(['PORT', 'MONGODB_URI', 'JWT_SECRET']),
    steps: z.array(z.string()).default([]),
    dockerfileSnippet: z.string().default('FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 5000\nCMD ["node", "src/server.js"]'),
    nginxSnippet: z.string().default('server {\n  listen 80;\n  location /api {\n    proxy_pass http://localhost:5000;\n  }\n}')
  }).default({})
});

/**
 * Validates arbitrary data against the Master Architecture Schema.
 * Returns { success: true, data: validatedBlueprint } or { success: false, errors: [] }
 */
export const validateArchitectureBlueprint = (data) => {
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      errors: ['Input blueprint data must be a non-null object.']
    };
  }

  const result = ArchitectureBlueprintSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errorMessages = issues.map(
      (err) => `${(err.path || []).join('.')}: ${err.message}`
    );
    return {
      success: false,
      errors: errorMessages
    };
  }

  // Ensure modules array is populated if empty by deriving from architecture nodes or frontend/backend
  const validated = result.data;
  if (!validated.modules || validated.modules.length === 0) {
    validated.modules = deriveModulesFromBlueprint(validated);
  }

  if (!validated.errorHandling || !validated.errorHandling.strategy) {
    validated.errorHandling = DEFAULT_ERROR_HANDLING;
  }

  return {
    success: true,
    data: validated
  };
};


/**
 * Helper to derive modular components if an AI response omits explicit modules
 */
export const deriveModulesFromBlueprint = (blueprint) => {
  const modules = [];

  // Frontend Module
  modules.push({
    name: 'Frontend Client Module',
    type: 'frontend',
    description: 'React SPA UI managing pages, authentication state, responsive views, and user interactions.',
    responsibilities: [
      'Render UI components and layouts',
      'Manage authentication tokens in local storage',
      'Handle client-side form validation and optimistic UI updates',
      'Interact with REST API endpoints'
    ],
    filePaths: [
      'frontend/src/App.jsx',
      'frontend/src/pages/Dashboard.jsx',
      'frontend/src/context/AuthContext.jsx',
      'frontend/src/services/api.js'
    ]
  });

  // Backend Core REST API Module
  modules.push({
    name: 'Backend API Gateway & Auth Module',
    type: 'backend',
    description: 'Express server entry point, CORS configuration, JWT authentication middleware, and route mounting.',
    responsibilities: [
      'Token verification & route protection',
      'Request rate limiting and JSON body parsing',
      'CORS headers management and health check',
      'Centralized async error handling'
    ],
    filePaths: [
      'backend/src/server.js',
      'backend/src/app.js',
      'backend/src/middleware/authMiddleware.js',
      'backend/src/routes/authRoutes.js'
    ]
  });

  // Domain Business Services & Controller Module
  if (blueprint.entities && blueprint.entities.length > 0) {
    blueprint.entities.forEach(entity => {
      modules.push({
        name: `${entity.name} Domain Service`,
        type: 'service',
        description: `CRUD operations, business rules validation, and persistence for ${entity.name}.`,
        responsibilities: [
          `Validate ${entity.name} payload schemas`,
          `Query and persist ${entity.name} documents to MongoDB`,
          `Enforce access control policies`
        ],
        filePaths: [
          `backend/src/models/${entity.name}.js`,
          `backend/src/controllers/${entity.name.toLowerCase()}Controller.js`,
          `backend/src/routes/${entity.name.toLowerCase()}Routes.js`
        ]
      });
    });
  }

  return modules;
};

export { generateArchitectureMarkdown } from '../services/exportService.js';

