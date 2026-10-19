/**
 * Frontend Architecture Export Utilities
 * Handles JSON bundle construction, file manifest extraction,
 * safe serialization, file downloads, and clipboard operations.
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
 * Builds the complete export bundle matching the currently displayed architecture.
 * @param {Object} project - Project model document or state object
 * @param {Array} findings - Consistency validation findings
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

  return {
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
};

/**
 * Safely serializes data into formatted JSON, guarding against circular references.
 * @param {any} data
 * @param {number} indent
 * @returns {{ success: boolean, json: string|null, error: string|null }}
 */
export const safeSerializeJson = (data, indent = 2) => {
  try {
    const seen = new WeakSet();
    const cleanString = JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }, indent);

    // Verify it parses cleanly
    JSON.parse(cleanString);
    return { success: true, json: cleanString, error: null };
  } catch (err) {
    return { success: false, json: null, error: err.message || 'Serialization failed' };
  }
};

/**
 * Initiates a browser file download using Blob and ObjectURL.
 * Handles DOM and permission errors gracefully.
 * @param {string} content
 * @param {string} filename
 * @param {string} mimeType
 * @returns {{ success: boolean, error?: string }}
 */
export const downloadFile = (content, filename, mimeType = 'application/json') => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { success: false, error: 'Browser environment required for file download.' };
    }

    if (content === null || content === undefined) {
      return { success: false, error: 'Cannot download empty content.' };
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.setAttribute('style', 'display: none;');
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 250);

    return { success: true };
  } catch (error) {
    console.error('File download failed:', error);
    return { success: false, error: error.message || 'Download failed due to browser restriction.' };
  }
};

/**
 * Copies text to the clipboard with fallback for older browsers or restricted permissions.
 * @param {string} text
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    }

    // Fallback using textarea execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) {
      return { success: true };
    } else {
      return { success: false, error: 'Copy command was unsuccessful.' };
    }
  } catch (err) {
    console.error('Copy to clipboard failed:', err);
    return { success: false, error: err.message || 'Failed to copy to clipboard.' };
  }
};
