import { validateArchitectureConsistency } from './consistencyValidator.js';
import { validateArchitectureBlueprint, DEFAULT_ERROR_HANDLING } from '../validators/architectureSchema.js';

/**
 * Applies targeted AI-assisted and rule-based repairs to an architectural blueprint.
 * Operates strictly on a deep copy, returning the proposed repaired architecture without mutating the original.
 */
export const repairArchitectureBlueprint = (originalBlueprint, selectedFindingIds = [], projectInfo = {}) => {
  if (!originalBlueprint || typeof originalBlueprint !== 'object') {
    throw new Error('Cannot repair null or non-object blueprint.');
  }

  // 1. Deep clone to guarantee original is completely untouched
  const repaired = JSON.parse(JSON.stringify(originalBlueprint));

  // 2. Identify active findings
  const initialFindings = validateArchitectureConsistency(repaired);
  const selectedSet = new Set(
    selectedFindingIds && selectedFindingIds.length > 0
      ? selectedFindingIds
      : initialFindings.map((f) => f.id)
  );

  const resolvedFindingIds = [];

  // Helper to check if a finding is targeted
  const shouldFix = (id) => selectedSet.has(id);

  /* =========================================================================
     A. REPAIR API ENDPOINTS
     ========================================================================= */
  if (Array.isArray(repaired.apiEndpoints)) {
    const seenRoutes = new Map();
    const uniqueApis = [];

    repaired.apiEndpoints.forEach((api, idx) => {
      let rawMethod = (api.method || '').trim().toUpperCase();
      let rawRoute = (api.endpoint || '').trim();

      // Fix 1: Missing or invalid method
      const invalidMethodFinding = initialFindings.find((f) => f.id === `api-method-invalid-${idx}`);
      if (invalidMethodFinding && shouldFix(invalidMethodFinding.id)) {
        if (!rawMethod || !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(rawMethod)) {
          if (rawRoute.includes('/create') || rawRoute.includes('/new') || rawRoute.includes('/add')) {
            rawMethod = 'POST';
          } else if (rawRoute.includes('/update') || rawRoute.includes('/edit')) {
            rawMethod = 'PUT';
          } else if (rawRoute.includes('/delete') || rawRoute.includes('/remove')) {
            rawMethod = 'DELETE';
          } else {
            rawMethod = 'GET';
          }
          api.method = rawMethod;
          resolvedFindingIds.push(invalidMethodFinding.id);
        }
      }

      // Fix 2: Duplicate Endpoints
      const dupFinding = initialFindings.find((f) => f.id === `api-duplicate-${idx}`);
      const endpointKey = `${rawMethod} ${rawRoute.toLowerCase().replace(/\/+$/, '')}`;
      if (dupFinding && shouldFix(dupFinding.id)) {
        if (seenRoutes.has(endpointKey)) {
          // Disambiguate route path or sub-resource
          const count = seenRoutes.get(endpointKey) + 1;
          seenRoutes.set(endpointKey, count);
          if (rawMethod === 'GET') {
            api.endpoint = `${rawRoute}/detail`;
          } else {
            api.endpoint = `${rawRoute}/batch`;
          }
          resolvedFindingIds.push(dupFinding.id);
        } else {
          seenRoutes.set(endpointKey, 1);
        }
      } else {
        seenRoutes.set(endpointKey, (seenRoutes.get(endpointKey) || 0) + 1);
      }

      // Fix 3: Incomplete Request Body
      const missingBodyFinding = initialFindings.find((f) => f.id === `api-missing-body-${idx}`);
      if (missingBodyFinding && shouldFix(missingBodyFinding.id)) {
        const routeLower = rawRoute.toLowerCase();
        if (routeLower.includes('order')) {
          api.requestBody = JSON.stringify({
            items: [{ itemId: 'string (ObjectId)', quantity: 2, price: 19.99 }],
            deliveryAddress: '123 Main St, Springfield',
            paymentMethod: 'CreditCard'
          }, null, 2);
        } else if (routeLower.includes('user') || routeLower.includes('auth')) {
          api.requestBody = JSON.stringify({
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'User'
          }, null, 2);
        } else if (routeLower.includes('appointment') || routeLower.includes('doctor')) {
          api.requestBody = JSON.stringify({
            doctorId: 'string (ObjectId)',
            patientId: 'string (ObjectId)',
            appointmentDate: '2026-11-01T10:00:00Z',
            reason: 'General Consultation'
          }, null, 2);
        } else {
          api.requestBody = JSON.stringify({
            name: 'Sample Item Title',
            status: 'Active',
            attributes: { category: 'Standard' }
          }, null, 2);
        }
        resolvedFindingIds.push(missingBodyFinding.id);
      }

      // Fix 4: Empty Response Definition
      const missingRespFinding = initialFindings.find((f) => f.id === `api-missing-response-${idx}`);
      if (missingRespFinding && shouldFix(missingRespFinding.id)) {
        api.response = JSON.stringify({
          success: true,
          data: {
            _id: '665a1b2c3d4e5f67890abcde',
            status: 'Success',
            createdAt: '2026-10-19T00:00:00.000Z'
          }
        }, null, 2);
        resolvedFindingIds.push(missingRespFinding.id);
      }

      // Fix 5: Unprotected sensitive mutating endpoints
      const unprotFinding = initialFindings.find((f) => f.id === `api-unprotected-${idx}`);
      if (unprotFinding && shouldFix(unprotFinding.id)) {
        api.authentication = 'Required (Bearer JWT)';
        api.headers = 'Authorization: Bearer <token>';
        resolvedFindingIds.push(unprotFinding.id);
      }

      // Fix 6: Missing documented errors
      const missingErrorsFinding = initialFindings.find((f) => f.id === `api-missing-errors-${idx}`);
      if (missingErrorsFinding && shouldFix(missingErrorsFinding.id)) {
        api.possibleErrors = ['400 Bad Request', '401 Unauthorized', '404 Not Found', '500 Internal Error'];
        resolvedFindingIds.push(missingErrorsFinding.id);
      }

      uniqueApis.push(api);
    });

    repaired.apiEndpoints = uniqueApis;
  }

  /* =========================================================================
     B. REPAIR DATABASE ENTITIES & RELATIONSHIPS
     ========================================================================= */
  if (!Array.isArray(repaired.entities)) {
    repaired.entities = [];
  }

  const existingEntityNames = new Set(repaired.entities.map((e) => (e.name || '').toLowerCase()));

  // Fix Undefined Relationship References
  if (Array.isArray(repaired.relationships)) {
    repaired.relationships.forEach((rel, rIdx) => {
      const fromFinding = initialFindings.find((f) => f.id === `rel-undefined-from-${rIdx}`);
      if (fromFinding && shouldFix(fromFinding.id)) {
        const fromName = rel.from || 'Resource';
        // Synthesize missing entity or remap
        if (!existingEntityNames.has(fromName.toLowerCase())) {
          repaired.entities.push({
            name: fromName,
            description: `Auto-generated domain entity representing ${fromName}.`,
            primaryKey: '_id (ObjectId)',
            foreignKeys: [],
            relationships: [],
            fields: [
              { name: '_id', type: 'ObjectId', required: true, description: 'Primary Key' },
              { name: 'name', type: 'String', required: true, description: 'Name attribute' },
              { name: 'createdAt', type: 'Date', required: true, description: 'Timestamp' }
            ]
          });
          existingEntityNames.add(fromName.toLowerCase());
          resolvedFindingIds.push(fromFinding.id);
        }
      }

      const toFinding = initialFindings.find((f) => f.id === `rel-undefined-to-${rIdx}`);
      if (toFinding && shouldFix(toFinding.id)) {
        const toName = rel.to || 'TargetResource';
        if (!existingEntityNames.has(toName.toLowerCase())) {
          repaired.entities.push({
            name: toName,
            description: `Auto-generated domain entity representing ${toName}.`,
            primaryKey: '_id (ObjectId)',
            foreignKeys: [],
            relationships: [],
            fields: [
              { name: '_id', type: 'ObjectId', required: true, description: 'Primary Key' },
              { name: 'title', type: 'String', required: true, description: 'Title attribute' },
              { name: 'createdAt', type: 'Date', required: true, description: 'Timestamp' }
            ]
          });
          existingEntityNames.add(toName.toLowerCase());
          resolvedFindingIds.push(toFinding.id);
        }
      }
    });
  }

  // Fix Foreign Keys referencing undefined models or inconsistent fields
  repaired.entities.forEach((entity, eIdx) => {
    if (Array.isArray(entity.foreignKeys)) {
      entity.foreignKeys = entity.foreignKeys.map((fk, fkIdx) => {
        const fkUndefModelFinding = initialFindings.find((f) => f.id === `fk-undefined-model-${eIdx}-${fkIdx}`);
        const fkInconsistentFieldFinding = initialFindings.find((f) => f.id === `fk-inconsistent-field-${eIdx}-${fkIdx}`);

        if (fkUndefModelFinding && shouldFix(fkUndefModelFinding.id)) {
          resolvedFindingIds.push(fkUndefModelFinding.id);
          // If referencing undefined model, point to User._id or first entity
          const fallbackModel = repaired.entities[0]?.name || 'User';
          return `${entity.name.toLowerCase()}Id -> ${fallbackModel}._id`;
        }

        if (fkInconsistentFieldFinding && shouldFix(fkInconsistentFieldFinding.id)) {
          resolvedFindingIds.push(fkInconsistentFieldFinding.id);
          // Standardize target field to primary key _id
          return fk.replace(/\.[A-Za-z0-9_]+$/, '._id');
        }

        return fk;
      });
    }

    // Fix empty fields in entity
    const emptyFieldsFinding = initialFindings.find((f) => f.id === `entity-empty-fields-${eIdx}`);
    if (emptyFieldsFinding && shouldFix(emptyFieldsFinding.id)) {
      entity.fields = [
        { name: '_id', type: 'ObjectId', required: true, description: 'Primary Key' },
        { name: 'name', type: 'String', required: true, description: 'Item name' },
        { name: 'status', type: 'String', required: true, description: 'Operational status' }
      ];
      resolvedFindingIds.push(emptyFieldsFinding.id);
    }
  });

  /* =========================================================================
     C. REPAIR ARCHITECTURE CONNECTIONS & ORPHAN NODES
     ========================================================================= */
  if (repaired.architecture && Array.isArray(repaired.architecture.connections)) {
    const nodeIds = new Set((repaired.architecture.nodes || []).map((n) => String(n.id)));

    repaired.architecture.connections = repaired.architecture.connections.filter((conn, cIdx) => {
      const invalidFrom = initialFindings.find((f) => f.id === `conn-invalid-from-${cIdx}`);
      const invalidTo = initialFindings.find((f) => f.id === `conn-invalid-to-${cIdx}`);

      if (invalidFrom && shouldFix(invalidFrom.id)) {
        resolvedFindingIds.push(invalidFrom.id);
        return false; // Remove orphan connection
      }
      if (invalidTo && shouldFix(invalidTo.id)) {
        resolvedFindingIds.push(invalidTo.id);
        return false; // Remove orphan connection
      }
      return nodeIds.has(String(conn.from)) && nodeIds.has(String(conn.to));
    });
  }

  /* =========================================================================
     D. REPAIR ERROR HANDLING SPECIFICATIONS
     ========================================================================= */
  const globalErrFinding = initialFindings.find((f) => f.id === 'err-missing-global-strategy');
  if (globalErrFinding && shouldFix(globalErrFinding.id)) {
    repaired.errorHandling = DEFAULT_ERROR_HANDLING;
    resolvedFindingIds.push(globalErrFinding.id);
  }

  const validationCodeFinding = initialFindings.find((f) => f.id === 'err-missing-validation-code');
  if (validationCodeFinding && shouldFix(validationCodeFinding.id)) {
    if (!repaired.errorHandling) repaired.errorHandling = DEFAULT_ERROR_HANDLING;
    if (!Array.isArray(repaired.errorHandling.httpCodes)) {
      repaired.errorHandling.httpCodes = DEFAULT_ERROR_HANDLING.httpCodes;
    } else {
      repaired.errorHandling.httpCodes.unshift({
        code: '400',
        scenario: 'Input payload schema validation failure',
        responseFormat: '{ "success": false, "message": "Validation failed", "errors": [] }'
      });
    }
    resolvedFindingIds.push(validationCodeFinding.id);
  }

  // 3. Re-validate through Zod schema to ensure structural validity
  const schemaValidation = validateArchitectureBlueprint(repaired);
  const validatedRepaired = schemaValidation.success ? schemaValidation.data : repaired;

  // 4. Re-run consistency validation on the proposed architecture
  const remainingFindings = validateArchitectureConsistency(validatedRepaired);

  return {
    proposed: validatedRepaired,
    initialFindingsCount: initialFindings.length,
    resolvedFindingsCount: resolvedFindingIds.length,
    resolvedFindingIds,
    remainingFindings
  };
};
