/**
 * Architecture Version Comparator
 * Compares two architecture blueprint revisions and computes
 * structural diffs across entities, REST endpoints, modules, and topology nodes.
 */

export const compareArchitectureVersions = (v1, v2) => {
  const base = v1 || {};
  const target = v2 || {};

  const diff = {
    hasChanges: false,
    totalDiffs: 0,
    entities: { added: [], removed: [], modified: [] },
    apiEndpoints: { added: [], removed: [], modified: [] },
    modules: { added: [], removed: [], modified: [] },
    nodes: { added: [], removed: [] },
    summary: 'No changes detected between architecture revisions.'
  };

  // 1. Entities Comparison
  const baseEntities = base.entities || [];
  const targetEntities = target.entities || [];
  const baseEntityMap = new Map(baseEntities.map(e => [e.name, e]));
  const targetEntityMap = new Map(targetEntities.map(e => [e.name, e]));

  targetEntities.forEach(e => {
    if (!baseEntityMap.has(e.name)) {
      diff.entities.added.push(e.name);
      diff.totalDiffs++;
    } else {
      const bEnt = baseEntityMap.get(e.name);
      const bFieldNames = (bEnt.fields || []).map(f => f.name).sort().join(',');
      const tFieldNames = (e.fields || []).map(f => f.name).sort().join(',');
      if (bFieldNames !== tFieldNames) {
        diff.entities.modified.push({
          name: e.name,
          change: 'Fields modified',
          baseFieldsCount: (bEnt.fields || []).length,
          targetFieldsCount: (e.fields || []).length
        });
        diff.totalDiffs++;
      }
    }
  });

  baseEntities.forEach(e => {
    if (!targetEntityMap.has(e.name)) {
      diff.entities.removed.push(e.name);
      diff.totalDiffs++;
    }
  });

  // 2. API Endpoints Comparison
  const baseApis = base.apiEndpoints || [];
  const targetApis = target.apiEndpoints || [];
  const apiSignature = (a) => `${(a.method || 'GET').toUpperCase()} ${a.endpoint || ''}`;

  const baseApiMap = new Map(baseApis.map(a => [apiSignature(a), a]));
  const targetApiMap = new Map(targetApis.map(a => [apiSignature(a), a]));

  targetApis.forEach(a => {
    const sig = apiSignature(a);
    if (!baseApiMap.has(sig)) {
      diff.apiEndpoints.added.push(sig);
      diff.totalDiffs++;
    } else {
      const bApi = baseApiMap.get(sig);
      if (bApi.authentication !== a.authentication) {
        diff.apiEndpoints.modified.push({
          endpoint: sig,
          change: `Auth changed: "${bApi.authentication}" -> "${a.authentication}"`
        });
        diff.totalDiffs++;
      }
    }
  });

  baseApis.forEach(a => {
    const sig = apiSignature(a);
    if (!targetApiMap.has(sig)) {
      diff.apiEndpoints.removed.push(sig);
      diff.totalDiffs++;
    }
  });

  // 3. Modules Comparison
  const baseModules = base.modules || [];
  const targetModules = target.modules || [];
  const baseModNames = new Set(baseModules.map(m => m.name));
  const targetModNames = new Set(targetModules.map(m => m.name));

  targetModules.forEach(m => {
    if (!baseModNames.has(m.name)) {
      diff.modules.added.push(m.name);
      diff.totalDiffs++;
    }
  });

  baseModules.forEach(m => {
    if (!targetModNames.has(m.name)) {
      diff.modules.removed.push(m.name);
      diff.totalDiffs++;
    }
  });

  // 4. Nodes Comparison
  const baseNodes = base.architecture?.nodes || [];
  const targetNodes = target.architecture?.nodes || [];
  const baseNodeIds = new Set(baseNodes.map(n => n.id));
  const targetNodeIds = new Set(targetNodes.map(n => n.id));

  targetNodes.forEach(n => {
    if (!baseNodeIds.has(n.id)) {
      diff.nodes.added.push(n.id);
      diff.totalDiffs++;
    }
  });

  baseNodes.forEach(n => {
    if (!targetNodeIds.has(n.id)) {
      diff.nodes.removed.push(n.id);
      diff.totalDiffs++;
    }
  });

  diff.hasChanges = diff.totalDiffs > 0;

  if (diff.hasChanges) {
    const parts = [];
    if (diff.entities.added.length) parts.push(`+${diff.entities.added.length} entities`);
    if (diff.entities.removed.length) parts.push(`-${diff.entities.removed.length} entities`);
    if (diff.entities.modified.length) parts.push(`${diff.entities.modified.length} entities modified`);
    if (diff.apiEndpoints.added.length) parts.push(`+${diff.apiEndpoints.added.length} endpoints`);
    if (diff.apiEndpoints.removed.length) parts.push(`-${diff.apiEndpoints.removed.length} endpoints`);
    if (diff.apiEndpoints.modified.length) parts.push(`${diff.apiEndpoints.modified.length} endpoints updated`);
    if (diff.modules.added.length) parts.push(`+${diff.modules.added.length} modules`);
    diff.summary = parts.join(', ');
  }

  return diff;
};
