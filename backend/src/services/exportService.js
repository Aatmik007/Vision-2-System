/**
 * Architecture Export Service
 * Produces validated JSON packages and formatted Markdown specifications
 * with project description, modules, APIs, database schemas, folder tree,
 * file descriptions, and validation findings.
 */

/**
 * Sanitizes a project name to produce a safe, human-readable filename slug.
 * @param {string} projectName
 * @param {string} extension
 * @returns {string} e.g. "quickbite-food-delivery-architecture.json"
 */
export const generateExportFilename = (projectName, extension = 'json') => {
  const cleanExt = (extension || 'json').replace(/^\./, '').toLowerCase();
  const slug = (projectName || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let baseSlug = slug || 'system';
  if (!baseSlug.endsWith('-architecture')) {
    baseSlug = `${baseSlug}-architecture`;
  }
  return `${baseSlug}.${cleanExt}`;
};

/**
 * Extracts and synthesizes a comprehensive file manifest with descriptions
 * from explicit folder structure, modules, entities, frontend components, and roadmap tasks.
 * @param {Object} blueprint
 * @returns {Array<{ path: string, description: string, type: string }>}
 */
export const extractFileManifest = (blueprint) => {
  if (!blueprint) return [];

  const manifestMap = new Map();

  const addFile = (path, description, type = 'source') => {
    if (!path || typeof path !== 'string') return;
    const cleanPath = path.trim().replace(/^[./\\]+/, '');
    if (!cleanPath || cleanPath.endsWith('/')) return;
    if (!manifestMap.has(cleanPath)) {
      manifestMap.set(cleanPath, {
        path: cleanPath,
        description: description || 'Source file',
        type: type || 'source'
      });
    }
  };

  // 1. Explicit fileManifest in folderStructure if present
  if (blueprint.folderStructure?.fileManifest && Array.isArray(blueprint.folderStructure.fileManifest)) {
    blueprint.folderStructure.fileManifest.forEach(f => {
      addFile(f.path, f.description, f.type);
    });
  }

  // 2. Module Target Files
  if (Array.isArray(blueprint.modules)) {
    blueprint.modules.forEach(mod => {
      if (Array.isArray(mod.filePaths)) {
        mod.filePaths.forEach(fp => {
          addFile(fp, `Module [${mod.name}]: ${mod.description || 'Core service logic'}`, mod.type || 'module');
        });
      }
    });
  }

  // 3. Database Entity Models
  if (Array.isArray(blueprint.entities)) {
    blueprint.entities.forEach(ent => {
      const modelPath = `backend/src/models/${ent.name}.js`;
      addFile(modelPath, `Mongoose schema and entity validation for ${ent.name} (PK: ${ent.primaryKey || '_id'})`, 'model');
    });
  }

  // 4. Frontend Pages and Components
  if (blueprint.frontend?.pages && Array.isArray(blueprint.frontend.pages)) {
    blueprint.frontend.pages.forEach(p => {
      const pageFile = `frontend/src/pages/${p.name.replace(/\s+/g, '')}.jsx`;
      addFile(pageFile, `Page View [${p.route || '/'}] - ${p.purpose || p.name}`, 'page');
    });
  }

  if (blueprint.frontend?.componentStructure && Array.isArray(blueprint.frontend.componentStructure)) {
    blueprint.frontend.componentStructure.forEach(c => {
      const compFile = `frontend/src/components/${c.name.replace(/\s+/g, '')}.jsx`;
      addFile(compFile, `UI Component: ${c.purpose || c.name}`, 'component');
    });
  }

  // 5. Roadmap Tasks Target Files
  if (Array.isArray(blueprint.roadmapPhases)) {
    blueprint.roadmapPhases.forEach(phase => {
      if (Array.isArray(phase.tasks)) {
        phase.tasks.forEach(task => {
          if (Array.isArray(task.files)) {
            task.files.forEach(f => {
              addFile(f, `Task [${task.taskId}] ${task.title}: ${task.description || ''}`, 'source');
            });
          }
        });
      }
    });
  }

  // 6. Common project configuration files
  addFile('package.json', 'Root project dependency manifest and execution scripts', 'config');
  addFile('backend/src/server.js', 'Express application entry point and HTTP server listener', 'backend-entry');
  addFile('frontend/src/App.jsx', 'Main React application router and global state provider', 'frontend-entry');

  return Array.from(manifestMap.values());
};

/**
 * Builds the complete export bundle as a valid JSON object matching the currently displayed architecture.
 * @param {Object} project - Project model document or object
 * @param {Array} findings - Consistency validation findings array
 * @param {Object} summary - Summary of consistency findings
 * @returns {Object} JSON-serializable bundle
 */
export const generateArchitectureExportBundle = (project = {}, findings = [], summary = null) => {
  const safeProject = project && typeof project === 'object' ? project : {};
  const blueprint = safeProject.generatedBlueprint || safeProject;
  const fileManifest = extractFileManifest(blueprint);

  const findingsList = Array.isArray(findings) ? findings : [];
  const errorsCount = findingsList.filter(f => f.severity === 'error').length;
  const warningsCount = findingsList.filter(f => f.severity === 'warning').length;
  const infoCount = findingsList.filter(f => f.severity === 'info' || f.severity === 'suggestion').length;

  const validationSummary = summary || {
    total: findingsList.length,
    errors: errorsCount,
    warnings: warningsCount,
    info: infoCount,
    isConsistent: errorsCount === 0
  };

  const bundle = {
    metadata: {
      projectName: safeProject.name || 'System Blueprint',
      description: safeProject.description || blueprint.overview || 'Architecture Blueprint',
      projectType: safeProject.projectType || 'Full-Stack Application',
      preferredStack: safeProject.preferredStack || 'MERN',
      createdAt: safeProject.createdAt || new Date().toISOString(),
      updatedAt: safeProject.updatedAt || new Date().toISOString(),
      exportedAt: new Date().toISOString(),
      formatVersion: '1.0.0',
      generator: 'Vision2System Architecture Engine'
    },
    overview: {
      summary: blueprint.overview || '',
      problemStatement: blueprint.problemStatement || '',
      assumptions: blueprint.assumptions || [],
      functionalRequirements: blueprint.functionalRequirements || [],
      nonFunctionalRequirements: blueprint.nonFunctionalRequirements || [],
      userRoles: blueprint.userRoles || [],
      features: blueprint.features || []
    },
    architectureTopology: {
      pattern: blueprint.architecture?.pattern || 'Microservices / Modular Monolith',
      dataFlow: blueprint.architecture?.dataFlow || 'Client -> API Gateway -> Services -> Database',
      summary: blueprint.architecture?.summary || '',
      nodes: blueprint.architecture?.nodes || [],
      connections: blueprint.architecture?.connections || []
    },
    modules: blueprint.modules || [],
    apiEndpoints: (blueprint.apiEndpoints || []).map(api => ({
      method: api.method || 'GET',
      endpoint: api.endpoint || '',
      description: api.description || '',
      authentication: api.authentication || 'Public',
      headers: api.headers || {},
      queryParams: api.queryParams || 'None',
      requestBody: api.requestBody || {},
      response: api.response || {},
      possibleErrors: api.possibleErrors || []
    })),
    databaseSchemas: (blueprint.entities || []).map(ent => ({
      name: ent.name,
      description: ent.description || '',
      primaryKey: ent.primaryKey || '_id',
      foreignKeys: ent.foreignKeys || [],
      relationships: ent.relationships || [],
      fields: ent.fields || []
    })),
    folderStructure: {
      frontendTree: typeof blueprint.folderStructure === 'object' ? (blueprint.folderStructure.frontend || '') : (blueprint.folderStructure || ''),
      backendTree: typeof blueprint.folderStructure === 'object' ? (blueprint.folderStructure.backend || '') : '',
      fileDescriptions: fileManifest
    },
    fileDescriptions: fileManifest,
    errorHandling: blueprint.errorHandling || {},
    security: blueprint.security || [],
    techStack: blueprint.techStack || [],
    roadmapPhases: blueprint.roadmapPhases || [],
    testing: blueprint.testing || [],
    deployment: blueprint.deployment || {},
    validationFindings: {
      status: validationSummary.errors > 0 ? 'Deficiencies Detected' : (validationSummary.total > 0 ? 'Warnings Present' : 'Consistent'),
      summary: validationSummary,
      findings: findingsList.map(f => ({
        id: f.id,
        severity: f.severity,
        category: f.category,
        targetNodeId: f.targetNodeId || null,
        message: f.message,
        details: f.details || '',
        suggestion: f.suggestion || ''
      }))
    },
    fullBlueprint: blueprint
  };

  return bundle;
};

/**
 * Generates an exhaustive, well-formatted Markdown specification document.
 * Backward compatible with existing (blueprint, projectName) signature.
 * @param {Object} blueprint
 * @param {string|Object} projectNameOrProject
 * @param {Object} [options] - Optional additional metadata, findings, and summary
 * @returns {string} Formatted GFM Markdown
 */
export const generateArchitectureMarkdown = (blueprint, projectNameOrProject = 'System Blueprint', options = {}) => {
  if (!blueprint) return '# Technical Architecture Blueprint\n\nNo architecture data available.';

  let projectName = 'System Blueprint';
  let projectDesc = '';
  let projectType = 'Full-Stack Application';
  let projectStack = 'MERN';
  let findings = [];
  let summary = null;

  if (typeof projectNameOrProject === 'object' && projectNameOrProject !== null) {
    projectName = projectNameOrProject.name || 'System Blueprint';
    projectDesc = projectNameOrProject.description || '';
    projectType = projectNameOrProject.projectType || 'Full-Stack Application';
    projectStack = projectNameOrProject.preferredStack || 'MERN';
  } else {
    projectName = String(projectNameOrProject);
  }

  if (Array.isArray(options)) {
    findings = options;
  } else if (options && typeof options === 'object') {
    if (options.project) {
      projectName = options.project.name || projectName;
      projectDesc = options.project.description || projectDesc;
      projectType = options.project.projectType || projectType;
      projectStack = options.project.preferredStack || projectStack;
    }
    if (Array.isArray(options.findings)) findings = options.findings;
    if (options.summary) summary = options.summary;
  }

  const fileManifest = extractFileManifest(blueprint);

  let md = `# Technical Architecture Blueprint: ${projectName}\n\n`;

  // Metadata block
  md += `> **Project Type:** ${projectType}  \n`;
  md += `> **Target Stack:** ${projectStack}  \n`;
  if (projectDesc) {
    md += `> **User Requirements / Prompt:** ${projectDesc}  \n`;
  }
  md += `> **Export Date:** ${new Date().toISOString().split('T')[0]}  \n\n`;
  md += `---\n\n`;

  // 1. Executive Overview
  md += `## 1. Executive Overview & Problem Statement\n\n`;
  md += `**Overview:**\n${blueprint.overview || 'N/A'}\n\n`;
  if (blueprint.problemStatement) {
    md += `**Problem Statement:**\n${blueprint.problemStatement}\n\n`;
  }
  if (blueprint.assumptions?.length > 0) {
    md += `### Assumptions & Context\n`;
    blueprint.assumptions.forEach(a => { md += `- ${a}\n`; });
    md += `\n`;
  }
  if (blueprint.features?.length > 0) {
    md += `### Key Features\n`;
    blueprint.features.forEach(f => { md += `- ${f}\n`; });
    md += `\n`;
  }

  // 2. System Architecture
  md += `## 2. System Architecture & Topology\n\n`;
  if (blueprint.architecture) {
    md += `- **Pattern:** ${blueprint.architecture.pattern || 'N/A'}\n`;
    md += `- **Data Flow:** ${blueprint.architecture.dataFlow || 'N/A'}\n`;
    if (blueprint.architecture.summary) {
      md += `- **Summary:** ${blueprint.architecture.summary}\n`;
    }
    md += `\n### Architectural Nodes\n\n`;
    md += `| Node ID | Type | Label | Description |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    (blueprint.architecture.nodes || []).forEach(node => {
      md += `| \`${node.id}\` | \`${node.type}\` | **${node.label}** | ${node.description} |\n`;
    });
    md += `\n### System Connections\n\n`;
    (blueprint.architecture.connections || []).forEach(conn => {
      md += `- \`${conn.from}\` ───[ *${conn.label}* ]───> \`${conn.to}\`\n`;
    });
    md += `\n`;
  }

  // 3. Modules Breakdown
  md += `## 3. Modular System Breakdown\n\n`;
  (blueprint.modules || []).forEach(mod => {
    md += `### ${mod.name} (\`${mod.type}\`)\n`;
    md += `${mod.description}\n\n`;
    if (mod.responsibilities?.length > 0) {
      md += `**Key Responsibilities:**\n`;
      mod.responsibilities.forEach(r => { md += `- ${r}\n`; });
      md += `\n`;
    }
    if (mod.filePaths?.length > 0) {
      md += `**Target Files:**\n`;
      mod.filePaths.forEach(fp => { md += `- \`${fp}\`\n`; });
      md += `\n`;
    }
  });

  // 4. REST API Endpoints
  md += `## 4. REST API Endpoints Specification\n\n`;
  (blueprint.apiEndpoints || []).forEach(api => {
    md += `### \`${api.method}\` ${api.endpoint}\n`;
    md += `${api.description}\n\n`;
    md += `- **Authentication:** ${api.authentication}\n`;
    md += `- **Headers:** \`${typeof api.headers === 'object' ? JSON.stringify(api.headers) : api.headers}\`\n`;
    md += `- **Query Parameters:** \`${typeof api.queryParams === 'object' ? JSON.stringify(api.queryParams) : api.queryParams}\`\n`;
    md += `- **Request Body:**\n\`\`\`json\n${typeof api.requestBody === 'object' ? JSON.stringify(api.requestBody, null, 2) : api.requestBody}\n\`\`\`\n`;
    md += `- **Response Body:**\n\`\`\`json\n${typeof api.response === 'object' ? JSON.stringify(api.response, null, 2) : api.response}\n\`\`\`\n`;
    if (api.possibleErrors?.length > 0) {
      md += `- **Possible Errors:** ${api.possibleErrors.join(', ')}\n`;
    }
    md += `\n---\n\n`;
  });

  // 5. Database Schema & Entities
  md += `## 5. Database Schema & Entities\n\n`;
  (blueprint.entities || []).forEach(entity => {
    md += `### Entity: \`${entity.name}\`\n`;
    md += `${entity.description}\n\n`;
    md += `- **Primary Key:** \`${entity.primaryKey}\`\n`;
    if (entity.foreignKeys?.length > 0) {
      md += `- **Foreign Keys:** ${entity.foreignKeys.join(', ')}\n`;
    }
    if (entity.relationships?.length > 0) {
      md += `- **Relationships:** ${entity.relationships.join(', ')}\n`;
    }
    md += `\n| Field Name | Type | Required | Description | Validation |\n`;
    md += `| :--- | :--- | :---: | :--- | :--- |\n`;
    (entity.fields || []).forEach(f => {
      md += `| \`${f.name}\` | \`${f.type}\` | ${f.required ? '✅ Yes' : 'No'} | ${f.description} | ${f.validation || 'None'} |\n`;
    });
    md += `\n`;
  });

  // 6. Error Handling
  md += `## 6. Error Handling & Resilience Architecture\n\n`;
  if (blueprint.errorHandling) {
    const eh = blueprint.errorHandling;
    md += `**Strategy:** ${eh.strategy}\n\n`;
    md += `| HTTP Code | Scenario | Standard Response Format |\n`;
    md += `| :---: | :--- | :--- |\n`;
    (eh.httpCodes || []).forEach(codeObj => {
      md += `| \`${codeObj.code}\` | ${codeObj.scenario} | \`${codeObj.responseFormat}\` |\n`;
    });
    md += `\n- **Logging Policy:** ${eh.logging}\n`;
    md += `- **Retry & Circuit Breaker Policy:** ${eh.retries}\n\n`;
  }

  // 7. Security Architecture
  md += `## 7. Security & Access Control\n\n`;
  (blueprint.security || []).forEach(sec => {
    md += `- **${sec.item}** [${sec.relevance}]: ${sec.recommendation}\n`;
  });
  md += `\n`;

  // 8. Folder Structure & File Manifest
  md += `## 8. Directory & Folder Structure\n\n`;
  md += `\`\`\`text\n`;
  if (typeof blueprint.folderStructure === 'object') {
    if (blueprint.folderStructure.frontend) md += `Frontend:\n${blueprint.folderStructure.frontend}\n\n`;
    if (blueprint.folderStructure.backend) md += `Backend:\n${blueprint.folderStructure.backend}\n`;
  } else {
    md += `${blueprint.folderStructure}\n`;
  }
  md += `\`\`\`\n\n`;

  // File Descriptions & Manifest Table
  if (fileManifest.length > 0) {
    md += `### File Descriptions & Manifest\n\n`;
    md += `| File Path | Type | Description |\n`;
    md += `| :--- | :--- | :--- |\n`;
    fileManifest.forEach(f => {
      md += `| \`${f.path}\` | \`${f.type}\` | ${f.description} |\n`;
    });
    md += `\n`;
  }

  // 9. Architecture Consistency & Validation Findings
  md += `## 9. Architecture Consistency & Validation Findings\n\n`;
  const errors = findings.filter(f => f.severity === 'error');
  const warnings = findings.filter(f => f.severity === 'warning');
  const infos = findings.filter(f => f.severity === 'info' || f.severity === 'suggestion');

  if (findings.length === 0) {
    md += `✅ **Conformance Status: Architecturally Consistent**\n\n`;
    md += `No structural discrepancies, broken relationships, or missing definitions detected across modules, APIs, and database models.\n\n`;
  } else {
    md += `⚠️ **Conformance Status: ${errors.length > 0 ? 'Deficiencies Detected' : 'Warnings / Suggestions Present'}**\n\n`;
    md += `- **Total Findings:** ${findings.length}\n`;
    md += `- **Errors:** ${errors.length}\n`;
    md += `- **Warnings:** ${warnings.length}\n`;
    md += `- **Informational Suggestions:** ${infos.length}\n\n`;

    md += `| Severity | Category | Target Component | Issue | Suggested Resolution |\n`;
    md += `| :---: | :--- | :--- | :--- | :--- |\n`;
    findings.forEach(f => {
      const sevIcon = f.severity === 'error' ? '❌ Error' : (f.severity === 'warning' ? '⚠️ Warning' : 'ℹ️ Info');
      const target = f.targetNodeId || f.details || 'System Blueprint';
      md += `| ${sevIcon} | \`${f.category}\` | \`${target}\` | ${f.message} | ${f.suggestion || 'Review component definition'} |\n`;
    });
    md += `\n`;
  }

  // 10. Implementation Roadmap
  md += `## 10. Implementation Roadmap & Milestones\n\n`;
  (blueprint.roadmapPhases || []).forEach(phase => {
    md += `### Phase ${phase.phaseNumber}: ${phase.phaseName}\n`;
    md += `*${phase.summary}*\n\n`;
    (phase.tasks || []).forEach(task => {
      md += `- **[${task.taskId}] ${task.title}** (${task.status})\n`;
      md += `  - Description: ${task.description}\n`;
      md += `  - Target Files: \`${(task.files || []).join(', ')}\`\n`;
      md += `  - Expected Result: ${task.expectedResult}\n`;
    });
    md += `\n`;
  });

  return md;
};
