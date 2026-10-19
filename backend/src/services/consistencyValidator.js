/**
 * Architecture Consistency Validation Engine
 * 
 * Inspects system blueprints for:
 * - Duplicate API endpoints
 * - Missing or invalid HTTP methods
 * - Incomplete request / response definitions
 * - Undefined models & dangling relationships
 * - Inconsistent field references
 * - Unprotected mutating endpoints & missing auth
 * - Missing error-handling specifications
 */

const STANDARD_HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

export const validateArchitectureConsistency = (blueprint) => {
  const findings = [];

  if (!blueprint || typeof blueprint !== 'object') {
    return [
      {
        id: 'crit-no-blueprint',
        severity: 'error',
        title: 'Missing Architecture Blueprint',
        description: 'No architecture blueprint data found to validate.',
        section: 'overview',
        targetNodeId: null,
        suggestedFix: 'Generate a technical blueprint from requirements.'
      }
    ];
  }

  const entities = Array.isArray(blueprint.entities) ? blueprint.entities : [];
  const entityNames = new Set(entities.map((e) => (e.name || '').trim().toLowerCase()));
  const entityFieldsMap = new Map();
  entities.forEach((e) => {
    const fields = Array.isArray(e.fields) ? e.fields.map((f) => f.name) : [];
    entityFieldsMap.set((e.name || '').toLowerCase(), new Set(fields));
  });

  const apiEndpoints = Array.isArray(blueprint.apiEndpoints) ? blueprint.apiEndpoints : [];
  const nodes = blueprint.architecture?.nodes || [];

  // Map to help locate target diagram node IDs
  const apiGatewayNode = nodes.find((n) => n.type === 'api' || n.type === 'apiNode' || n.id === 'gateway' || n.id === 'api');
  const databaseNode = nodes.find((n) => n.type === 'database' || n.type === 'databaseNode' || n.id === 'database');
  const serviceNode = nodes.find((n) => n.type === 'service' || n.type === 'serviceNode' || n.type === 'backend');

  /* =========================================================================
     1. API ENDPOINT VALIDATIONS
     ========================================================================= */
  const seenEndpoints = new Map();

  apiEndpoints.forEach((api, idx) => {
    const rawMethod = (api.method || '').trim().toUpperCase();
    const rawRoute = (api.endpoint || '').trim().toLowerCase().replace(/\/+$/, '');
    const endpointKey = `${rawMethod} ${rawRoute}`;

    // 1.1 Missing or invalid HTTP method
    if (!rawMethod || !STANDARD_HTTP_METHODS.has(rawMethod)) {
      findings.push({
        id: `api-method-invalid-${idx}`,
        severity: 'error',
        title: `Invalid HTTP Method for "${api.endpoint || 'Unknown Route'}"`,
        description: `Endpoint is defined with missing or unsupported HTTP method "${api.method}". Expected one of: GET, POST, PUT, PATCH, DELETE.`,
        section: 'apis',
        targetNodeId: apiGatewayNode?.id || 'gateway',
        targetItem: api.endpoint,
        suggestedFix: `Specify a standard REST method (e.g. GET, POST, PUT, DELETE).`
      });
    }

    // 1.2 Duplicate API endpoints
    if (rawMethod && rawRoute) {
      if (seenEndpoints.has(endpointKey)) {
        findings.push({
          id: `api-duplicate-${idx}`,
          severity: 'error',
          title: `Duplicate Endpoint: "${endpointKey}"`,
          description: `Endpoint "${rawMethod} ${rawRoute}" is declared multiple times in the REST API specifications.`,
          section: 'apis',
          targetNodeId: apiGatewayNode?.id || 'gateway',
          targetItem: endpointKey,
          suggestedFix: `Consolidate redundant routes or differentiate route paths (e.g. by adding sub-resource parameters).`
        });
      } else {
        seenEndpoints.set(endpointKey, idx);
      }
    }

    // 1.3 Incomplete request definitions for mutating endpoints
    if (['POST', 'PUT', 'PATCH'].includes(rawMethod)) {
      const body = api.requestBody;
      const isMissingBody =
        !body ||
        body === 'None' ||
        body === 'null' ||
        body === '{}' ||
        (typeof body === 'object' && Object.keys(body).length === 0);

      if (isMissingBody) {
        findings.push({
          id: `api-missing-body-${idx}`,
          severity: 'warning',
          title: `Incomplete Request Body for ${rawMethod} "${api.endpoint}"`,
          description: `Mutating endpoint ${rawMethod} ${api.endpoint} lacks a defined request body payload schema or example.`,
          section: 'apis',
          targetNodeId: apiGatewayNode?.id || 'gateway',
          targetItem: api.endpoint,
          suggestedFix: `Provide explicit JSON request body fields with types and example values.`
        });
      }
    }

    // 1.4 Incomplete response definition
    const resp = api.response;
    const isMissingResp =
      !resp ||
      resp === 'None' ||
      resp === 'null' ||
      resp === '{}' ||
      (typeof resp === 'object' && Object.keys(resp).length === 0);

    if (isMissingResp) {
      findings.push({
        id: `api-missing-response-${idx}`,
        severity: 'warning',
        title: `Empty Response Definition for "${api.endpoint}"`,
        description: `Endpoint ${rawMethod} ${api.endpoint} does not specify return payload structure.`,
        section: 'apis',
        targetNodeId: apiGatewayNode?.id || 'gateway',
        targetItem: api.endpoint,
        suggestedFix: `Define the expected JSON response format (e.g. { success: true, data: { ... } }).`
      });
    }

    // 1.5 Unprotected sensitive mutating endpoints
    const auth = (api.authentication || '').toLowerCase();
    const isPublic = auth.includes('public') || auth.includes('none') || !auth;
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(rawMethod);
    const isAuthRoute = rawRoute.includes('/login') || rawRoute.includes('/register') || rawRoute.includes('/forgot-password') || rawRoute.includes('/auth');

    if (isMutating && isPublic && !isAuthRoute) {
      findings.push({
        id: `api-unprotected-${idx}`,
        severity: 'warning',
        title: `Potentially Unprotected Endpoint: ${rawMethod} "${api.endpoint}"`,
        description: `Mutating route ${rawMethod} ${api.endpoint} is configured with "${api.authentication || 'None'}" access. Sensitive mutations should require JWT Bearer authentication.`,
        section: 'apis',
        targetNodeId: apiGatewayNode?.id || 'gateway',
        targetItem: api.endpoint,
        suggestedFix: `Enforce "Required (Bearer JWT)" authentication and assign appropriate role permissions.`
      });
    }

    // 1.6 Missing error handling on endpoints
    if (!api.possibleErrors || api.possibleErrors.length === 0) {
      findings.push({
        id: `api-missing-errors-${idx}`,
        severity: 'info',
        title: `Missing Documented Error Responses for "${api.endpoint}"`,
        description: `Endpoint does not document expected HTTP error codes (e.g. 400 Bad Request, 404 Not Found, 500 Server Error).`,
        section: 'apis',
        targetNodeId: apiGatewayNode?.id || 'gateway',
        targetItem: api.endpoint,
        suggestedFix: `Document standard HTTP failure codes: 400 Bad Request, 401 Unauthorized, 404 Not Found.`
      });
    }
  });

  /* =========================================================================
     2. DATABASE & ENTITY RELATIONSHIP VALIDATIONS
     ========================================================================= */
  const relationships = Array.isArray(blueprint.relationships) ? blueprint.relationships : [];

  relationships.forEach((rel, idx) => {
    const fromEntity = (rel.from || '').trim().toLowerCase();
    const toEntity = (rel.to || '').trim().toLowerCase();

    // 2.1 Relationship references non-existent 'from' entity
    if (fromEntity && !entityNames.has(fromEntity)) {
      findings.push({
        id: `rel-undefined-from-${idx}`,
        severity: 'error',
        title: `Undefined Entity Reference: "${rel.from}" in Relationship`,
        description: `Relationship originates from "${rel.from}", but no entity with this name is defined in database models.`,
        section: 'database',
        targetNodeId: databaseNode?.id || 'database',
        targetItem: rel.from,
        suggestedFix: `Add model definition for "${rel.from}" or correct relationship reference to match an existing entity.`
      });
    }

    // 2.2 Relationship references non-existent 'to' entity
    if (toEntity && !entityNames.has(toEntity)) {
      findings.push({
        id: `rel-undefined-to-${idx}`,
        severity: 'error',
        title: `Undefined Entity Reference: "${rel.to}" in Relationship`,
        description: `Relationship targets "${rel.to}", but no entity with this name is defined in database models.`,
        section: 'database',
        targetNodeId: databaseNode?.id || 'database',
        targetItem: rel.to,
        suggestedFix: `Add model definition for "${rel.to}" or align relationship target.`
      });
    }
  });

  // 2.3 Foreign Key References
  entities.forEach((entity, eIdx) => {
    const fks = Array.isArray(entity.foreignKeys) ? entity.foreignKeys : [];
    fks.forEach((fk, fkIdx) => {
      const fkStr = typeof fk === 'string' ? fk : JSON.stringify(fk);
      // e.g., "customer -> User._id" or "restaurantId -> Restaurant._id"
      const match = fkStr.match(/->\s*([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)/);
      if (match) {
        const targetModel = match[1].toLowerCase();
        const targetField = match[2];

        if (!entityNames.has(targetModel)) {
          findings.push({
            id: `fk-undefined-model-${eIdx}-${fkIdx}`,
            severity: 'error',
            title: `Undefined Foreign Key Target Model in "${entity.name}"`,
            description: `Entity "${entity.name}" references non-existent model "${match[1]}" in foreign key "${fkStr}".`,
            section: 'database',
            targetNodeId: databaseNode?.id || 'database',
            targetItem: `${entity.name}.${fkStr}`,
            suggestedFix: `Update foreign key reference to point to a defined model (e.g. User, Restaurant).`
          });
        } else {
          // Check if field exists on target model
          const fields = entityFieldsMap.get(targetModel);
          if (fields && !fields.has(targetField) && targetField !== '_id' && targetField !== 'id') {
            findings.push({
              id: `fk-inconsistent-field-${eIdx}-${fkIdx}`,
              severity: 'warning',
              title: `Inconsistent Field Reference in "${entity.name}" FK`,
              description: `Entity "${entity.name}" references field "${targetField}" on "${match[1]}", but "${targetField}" is not declared in that model's fields list.`,
              section: 'database',
              targetNodeId: databaseNode?.id || 'database',
              targetItem: `${entity.name}.${targetField}`,
              suggestedFix: `Align foreign key target field with declared schema fields (typically "_id").`
            });
          }
        }
      }
    });

    // 2.4 Entity without fields
    if (!entity.fields || entity.fields.length === 0) {
      findings.push({
        id: `entity-empty-fields-${eIdx}`,
        severity: 'error',
        title: `Empty Schema Definition for Entity "${entity.name}"`,
        description: `Entity "${entity.name}" has no declared attributes or field types.`,
        section: 'database',
        targetNodeId: databaseNode?.id || 'database',
        targetItem: entity.name,
        suggestedFix: `Declare at least a primary key (_id) and core domain fields.`
      });
    }
  });

  /* =========================================================================
     3. ARCHITECTURE TOPOLOGY & NODE CONSISTENCY
     ========================================================================= */
  const connections = blueprint.architecture?.connections || [];
  const nodeIds = new Set(nodes.map((n) => String(n.id)));

  connections.forEach((conn, cIdx) => {
    if (!nodeIds.has(String(conn.from))) {
      findings.push({
        id: `conn-invalid-from-${cIdx}`,
        severity: 'error',
        title: `Orphan Connection Source "${conn.from}"`,
        description: `Architecture connection references origin node "${conn.from}" which does not exist in nodes list.`,
        section: 'architecture',
        targetNodeId: null,
        targetItem: conn.from,
        suggestedFix: `Define node "${conn.from}" in architecture.nodes or remove the connection.`
      });
    }
    if (!nodeIds.has(String(conn.to))) {
      findings.push({
        id: `conn-invalid-to-${cIdx}`,
        severity: 'error',
        title: `Orphan Connection Target "${conn.to}"`,
        description: `Architecture connection references destination node "${conn.to}" which does not exist in nodes list.`,
        section: 'architecture',
        targetNodeId: null,
        targetItem: conn.to,
        suggestedFix: `Define node "${conn.to}" in architecture.nodes or remove the connection.`
      });
    }
  });

  /* =========================================================================
     4. SYSTEM-WIDE ERROR HANDLING CONSIDERATIONS
     ========================================================================= */
  if (!blueprint.errorHandling || !blueprint.errorHandling.strategy) {
    findings.push({
      id: `err-missing-global-strategy`,
      severity: 'warning',
      title: `Missing Centralized Error Handling Strategy`,
      description: `The blueprint lacks a formalized global error middleware policy or status code matrix.`,
      section: 'errorhandling',
      targetNodeId: serviceNode?.id || 'backend',
      targetItem: 'errorHandling',
      suggestedFix: `Define centralized Express error middleware with standard 400, 401, 403, 404, 500 JSON response structures.`
    });
  } else {
    const codes = (blueprint.errorHandling.httpCodes || []).map((c) => String(c.code));
    if (!codes.includes('400') && !codes.includes('422')) {
      findings.push({
        id: `err-missing-validation-code`,
        severity: 'info',
        title: `No Validation Failure (400/422) Code in Error Policy`,
        description: `Error handling policy does not define the standard JSON contract for input validation rejections.`,
        section: 'errorhandling',
        targetNodeId: serviceNode?.id || 'backend',
        targetItem: 'errorHandling.httpCodes',
        suggestedFix: `Add HTTP 400 Bad Request error contract to errorHandling.httpCodes.`
      });
    }
  }

  return findings;
};

/**
 * Summarizes findings by severity
 */
export const summarizeFindings = (findings = []) => {
  return {
    total: findings.length,
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
    isConsistent: findings.filter((f) => f.severity === 'error').length === 0
  };
};
