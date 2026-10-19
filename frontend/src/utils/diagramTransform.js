import { MarkerType } from 'reactflow';

/**
 * Categorizes a raw node type or label into one of five standard architectural node categories.
 */
export const categorizeNodeType = (type = '', id = '', label = '') => {
  const combined = `${type} ${id} ${label}`.toLowerCase();

  // 1. External integrations & third-party APIs
  if (
    type === 'external' ||
    combined.includes('stripe') ||
    combined.includes('twilio') ||
    combined.includes('cloud') ||
    combined.includes('external') ||
    combined.includes('oauth') ||
    combined.includes('thirdparty') ||
    combined.includes('sendgrid') ||
    combined.includes('aws')
  ) {
    return 'externalNode';
  }

  // 2. Client & Frontend SPA
  if (
    type === 'user' ||
    type === 'frontend' ||
    combined.includes('client') ||
    combined.includes('browser') ||
    combined.includes('frontend') ||
    combined.includes('spa') ||
    combined.includes('ui') ||
    combined.includes('react')
  ) {
    return 'frontendNode';
  }

  // 3. Database & Datastores
  if (
    type === 'database' ||
    combined.includes('database') ||
    combined.includes('mongo') ||
    combined.includes('sql') ||
    combined.includes('redis') ||
    combined.includes('store') ||
    combined.includes('model') ||
    combined.includes('schema')
  ) {
    return 'databaseNode';
  }

  // 4. API Gateways & Routes
  if (
    type === 'api' ||
    combined.includes('gateway') ||
    combined.includes('router') ||
    combined.includes('route') ||
    combined.includes('api')
  ) {
    return 'apiNode';
  }

  return 'serviceNode';
};

/**
 * Column X coordinates ensuring non-overlapping architectural layout
 */
export const COLUMN_X_COORDS = {
  frontendNode: 50,
  apiNode: 370,
  serviceNode: 690,
  databaseNode: 1010,
  externalNode: 1330
};

/**
 * Transforms validated architecture JSON into React Flow compatible nodes and edges.
 */
export const transformArchitectureToDiagram = (architecture = {}, blueprint = {}) => {
  if (!architecture && !blueprint) {
    return { nodes: [], edges: [] };
  }

  // 1. Gather raw nodes
  let rawNodes = architecture?.nodes || [];

  // If no nodes exist in architecture, synthesize from modules or entities
  if (!rawNodes || rawNodes.length === 0) {
    rawNodes = [
      { id: 'client', label: 'React SPA Client', type: 'frontend', description: 'Web Client Interface' },
      { id: 'api_gateway', label: 'Express API Gateway', type: 'api', description: 'REST APIs & Route Middleware' },
      { id: 'backend_service', label: 'Backend Controller Service', type: 'service', description: 'Business Logic & Validation' },
      { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Document Collections' }
    ];
  }

  // Column counters for calculating vertical Y coordinates to prevent overlap
  const columnIndices = {
    frontendNode: 0,
    apiNode: 0,
    serviceNode: 0,
    databaseNode: 0,
    externalNode: 0
  };

  const nodes = [];
  const nodeMap = new Map();

  rawNodes.forEach((node, idx) => {
    const customType = categorizeNodeType(node.type, node.id, node.label);
    const colX = COLUMN_X_COORDS[customType] || 690;
    const rowIndex = columnIndices[customType]++;
    const posY = 50 + rowIndex * 150;

    const nodeId = String(node.id || `node_${idx}`);

    // Enrich with blueprint details
    const associatedApis = (blueprint?.apiEndpoints || []).filter(api => {
      const matchKey = (node.label + ' ' + node.id).toLowerCase();
      return (
        customType === 'apiNode' ||
        (customType === 'serviceNode' && matchKey.includes('controller')) ||
        api.endpoint.toLowerCase().includes(nodeId.toLowerCase())
      );
    });

    const associatedEntity = (blueprint?.entities || []).find(e => {
      const matchKey = (node.label + ' ' + node.id).toLowerCase();
      return (
        matchKey.includes(e.name.toLowerCase()) ||
        (customType === 'databaseNode' && blueprint.entities.length === 1)
      );
    });

    const associatedModule = (blueprint?.modules || []).find(m => {
      const matchKey = (node.label + ' ' + node.id).toLowerCase();
      return matchKey.includes(m.name.toLowerCase()) || m.type === node.type;
    });

    const nodeData = {
      id: nodeId,
      rawId: node.id,
      label: node.label || 'System Node',
      type: customType,
      rawType: node.type || 'service',
      description: node.description || 'System component handling domain operations.',
      filePaths: node.filePaths || associatedModule?.filePaths || [],
      responsibilities: associatedModule?.responsibilities || [],
      associatedApis: associatedApis.slice(0, 5),
      associatedEntity: associatedEntity || null
    };

    const flowNode = {
      id: nodeId,
      type: customType,
      position: { x: colX, y: posY },
      data: nodeData,
      dragHandle: '.custom-drag-handle'
    };

    nodes.push(flowNode);
    nodeMap.set(nodeId, flowNode);
  });

  // 2. Gather raw connections and build edges
  let rawConnections = architecture?.connections || [];

  // Default connection chain if none provided
  if (!rawConnections || rawConnections.length === 0) {
    for (let i = 0; i < nodes.length - 1; i++) {
      rawConnections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: 'Flow'
      });
    }
  }

  const edges = [];
  rawConnections.forEach((conn, idx) => {
    const sourceId = String(conn.from);
    const targetId = String(conn.to);

    // Verify both endpoints exist
    if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
      edges.push({
        id: `edge_${sourceId}_${targetId}_${idx}`,
        source: sourceId,
        target: targetId,
        label: conn.label || 'Data Flow',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        labelStyle: { fill: '#94a3b8', fontSize: 11, fontWeight: 500 },
        labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85, stroke: '#334155', strokeWidth: 1 },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366f1',
          width: 18,
          height: 18
        }
      });
    }
  });

  return { nodes, edges };
};
