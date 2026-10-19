import { extractFileManifest } from './exportGenerator.js';

/**
 * Client-side Architecture Markdown Specification Generator
 * Generates an exhaustive, production-grade Markdown document from validated architecture data,
 * including project description, modules, APIs, database schemas, folder tree, file descriptions,
 * and consistency validation findings.
 *
 * @param {Object} blueprint
 * @param {string|Object} projectNameOrProject
 * @param {Object} [options]
 * @returns {string} Formatted Markdown
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

  // 1. Executive Overview & Problem Statement
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

  // 2. System Architecture & Topology
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

  // 3. Modular System Breakdown
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

  // 4. REST API Endpoints Specification
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

  // 6. Error Handling & Resilience Architecture
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

  // 7. Security & Access Control
  md += `## 7. Security & Access Control\n\n`;
  (blueprint.security || []).forEach(sec => {
    md += `- **${sec.item}** [${sec.relevance}]: ${sec.recommendation}\n`;
  });
  md += `\n`;

  // 8. Directory & Folder Structure
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

  // 10. Implementation Roadmap & Milestones
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
