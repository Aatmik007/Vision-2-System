/**
 * Semantic Correctness Evaluator
 * Evaluates domain entity alignment, route coherence, authentication logic,
 * and architectural fitness to distinguish semantic validity from schema syntax.
 */

export const evaluateSemanticCorrectness = (blueprint, testCase) => {
  if (!blueprint || typeof blueprint !== 'object') {
    return {
      semanticScore: 0,
      domainRelevance: 'None',
      criteria: {},
      findings: ['Blueprint is empty or invalid.']
    };
  }

  const criteria = {};
  const findings = [];
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Domain Entity Coverage (Weight: 30)
  totalWeight += 30;
  const existingEntityNames = (blueprint.entities || []).map(e => e.name.toLowerCase());
  const expectedEntities = testCase.expectedEntities || [];
  
  if (expectedEntities.length > 0) {
    const matchedEntities = expectedEntities.filter(exp => 
      existingEntityNames.some(act => act.includes(exp.toLowerCase()) || exp.toLowerCase().includes(act))
    );
    const entityRatio = matchedEntities.length / expectedEntities.length;
    const entityScore = Math.round(entityRatio * 30);
    totalScore += entityScore;

    criteria.entityCoverage = {
      score: entityScore,
      max: 30,
      passed: entityRatio >= 0.75,
      matched: matchedEntities,
      expected: expectedEntities,
      details: `${matchedEntities.length}/${expectedEntities.length} domain entities present`
    };

    if (entityRatio < 1) {
      const missing = expectedEntities.filter(exp => !matchedEntities.includes(exp));
      findings.push(`Semantic entity gap: Missing expected domain entities [${missing.join(', ')}]`);
    }
  } else {
    // If no specific expected entities, verify at least some entities exist
    const hasEntities = (blueprint.entities || []).length > 0;
    const score = hasEntities ? 30 : 10;
    totalScore += score;
    criteria.entityCoverage = {
      score,
      max: 30,
      passed: hasEntities,
      details: `${(blueprint.entities || []).length} entities defined`
    };
  }

  // 2. REST API Route Suitability & Coverage (Weight: 25)
  totalWeight += 25;
  const apis = blueprint.apiEndpoints || [];
  const expectedEndpoints = testCase.expectedEndpoints || [];
  
  if (expectedEndpoints.length > 0) {
    const matchedEndpoints = expectedEndpoints.filter(exp =>
      apis.some(api => (api.endpoint || '').toLowerCase().includes(exp.toLowerCase()))
    );
    const endpointRatio = matchedEndpoints.length / expectedEndpoints.length;
    const apiScore = Math.round(endpointRatio * 25);
    totalScore += apiScore;

    criteria.endpointCoverage = {
      score: apiScore,
      max: 25,
      passed: endpointRatio >= 0.5,
      matched: matchedEndpoints,
      expected: expectedEndpoints,
      details: `${matchedEndpoints.length}/${expectedEndpoints.length} expected route prefixes found`
    };

    if (endpointRatio < 1) {
      const missing = expectedEndpoints.filter(exp => !matchedEndpoints.includes(exp));
      findings.push(`Route coverage recommendation: Consider adding endpoints for [${missing.join(', ')}]`);
    }
  } else {
    const hasApis = apis.length >= 2;
    const score = hasApis ? 25 : 10;
    totalScore += score;
    criteria.endpointCoverage = {
      score,
      max: 25,
      passed: hasApis,
      details: `${apis.length} API endpoints defined`
    };
  }

  // 3. Mutating Route Authentication Logic (Weight: 20)
  totalWeight += 20;
  const mutatingApis = apis.filter(a => ['POST', 'PUT', 'PATCH', 'DELETE'].includes((a.method || '').toUpperCase()));
  if (mutatingApis.length > 0) {
    const protectedCount = mutatingApis.filter(a => {
      const auth = (a.authentication || '').toLowerCase();
      return !auth.includes('public') && (auth.includes('required') || auth.includes('jwt') || auth.includes('bearer') || auth.includes('auth'));
    }).length;
    const authRatio = protectedCount / mutatingApis.length;
    const authScore = Math.round(authRatio * 20);
    totalScore += authScore;

    criteria.authSecurity = {
      score: authScore,
      max: 20,
      passed: authRatio >= 0.7,
      details: `${protectedCount}/${mutatingApis.length} mutating routes enforce authentication`
    };

    if (authRatio < 1) {
      findings.push(`Auth security notice: ${mutatingApis.length - protectedCount} mutating routes lack explicit authentication`);
    }
  } else {
    totalScore += 20;
    criteria.authSecurity = { score: 20, max: 20, passed: true, details: 'No mutating routes to evaluate' };
  }

  // 4. Schema Relationship & Foreign Key Integrity (Weight: 15)
  totalWeight += 15;
  const entities = blueprint.entities || [];
  let relationsCount = 0;
  entities.forEach(ent => {
    relationsCount += (ent.relationships || []).length + (ent.foreignKeys || []).length;
  });
  const hasRelations = relationsCount >= Math.max(1, entities.length - 1);
  const relScore = hasRelations ? 15 : (relationsCount > 0 ? 10 : 5);
  totalScore += relScore;

  criteria.relationshipIntegrity = {
    score: relScore,
    max: 15,
    passed: hasRelations,
    details: `${relationsCount} entity relationships / foreign keys linked`
  };

  // 5. Domain Specific Architecture Cohesion (Weight: 10)
  totalWeight += 10;
  let archScore = 10;
  if (testCase.requiresRealtime) {
    const archText = JSON.stringify(blueprint.architecture || {}).toLowerCase() + JSON.stringify(blueprint.techStack || []).toLowerCase();
    const hasSocketOrRealtime = archText.includes('socket') || archText.includes('websocket') || archText.includes('realtime') || archText.includes('real-time') || archText.includes('live');
    if (!hasSocketOrRealtime) {
      archScore = 4;
      findings.push('Architecture recommendation: Domain benefits from real-time WebSocket communication');
    }
  }
  totalScore += archScore;
  criteria.architectureCohesion = {
    score: archScore,
    max: 10,
    passed: archScore >= 8,
    details: 'Architecture topology matches domain requirements'
  };

  const finalScore = Math.min(100, Math.round((totalScore / totalWeight) * 100));
  const domainRelevance = finalScore >= 85 ? 'High' : (finalScore >= 65 ? 'Medium' : 'Low');

  return {
    semanticScore: finalScore,
    domainRelevance,
    criteria,
    findings
  };
};
