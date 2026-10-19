import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  X,
  FileCode,
  Server,
  Database,
  Cloud,
  Check,
  Copy,
  Info,
  ShieldCheck,
  ArrowRight,
  Filter,
  Activity
} from 'lucide-react';
import { transformArchitectureToDiagram } from '../utils/diagramTransform';
import { nodeTypes } from './flow/CustomNodes';

/**
 * Inner Flow Canvas with access to useReactFlow hooks
 */
const FlowCanvas = ({ architecture, blueprint, onSelectNode, selectedNodeId }) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const { initialNodes, initialEdges } = useMemo(() => {
    const { nodes, edges } = transformArchitectureToDiagram(architecture, blueprint);
    return { initialNodes: nodes, initialEdges: edges };
  }, [architecture, blueprint]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Update nodes and edges whenever architecture changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = transformArchitectureToDiagram(architecture, blueprint);
    setNodes(newNodes);
    setEdges(newEdges);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [architecture, blueprint, fitView, setNodes, setEdges]);

  // Highlight selected node
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
        style: filterType === 'all' || node.type === filterType
          ? { opacity: 1 }
          : { opacity: 0.25 }
      }))
    );
  }, [selectedNodeId, filterType, setNodes]);

  const handleNodeClick = useCallback(
    (_, node) => {
      onSelectNode(node.data);
    },
    [onSelectNode]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
      {/* Top Controls Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Component Type Filter */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 shadow-lg pointer-events-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-indigo-400 mr-1" />
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({nodes.length})
          </button>
          <button
            onClick={() => setFilterType('frontendNode')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'frontendNode' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Frontend
          </button>
          <button
            onClick={() => setFilterType('apiNode')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'apiNode' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            APIs
          </button>
          <button
            onClick={() => setFilterType('serviceNode')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'serviceNode' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setFilterType('databaseNode')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'databaseNode' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Database
          </button>
        </div>

        {/* Right: Canvas Actions */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-lg pointer-events-auto">
          <button
            onClick={() => zoomIn({ duration: 200 })}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomOut({ duration: 200 })}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFitView}
            className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="Fit to Screen"
            aria-label="Fit diagram to screen"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1" />
            <span>Fit View</span>
          </button>
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className={`p-1.5 rounded transition ${
              showMiniMap ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle MiniMap"
            aria-label="Toggle MiniMap"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* React Flow Workspace */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        attributionPosition="bottom-left"
        className="touch-none select-none"
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls showInteractive={false} className="!bg-slate-900 !border-slate-800 !fill-slate-300 !bottom-4 !left-4" />
        {showMiniMap && (
          <MiniMap
            nodeColor={(n) => {
              switch (n.type) {
                case 'frontendNode': return '#06b6d4';
                case 'apiNode': return '#10b981';
                case 'serviceNode': return '#6366f1';
                case 'databaseNode': return '#f59e0b';
                case 'externalNode': return '#f43f5e';
                default: return '#64748b';
              }
            }}
            maskColor="rgba(15, 23, 42, 0.75)"
            className="!bg-slate-900 !border-slate-800 !bottom-4 !right-4 rounded-lg overflow-hidden"
          />
        )}
      </ReactFlow>

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-16 z-10 hidden sm:flex items-center space-x-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Client SPA</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>API Gateway</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span>Service Logic</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Database</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>External</span>
        </span>
      </div>
    </div>
  );
};

/**
 * Slide-over Detail Inspector Panel for Selected Node
 */
const NodeDetailPanel = ({ nodeData, onClose, connections = [] }) => {
  const [copiedPath, setCopiedPath] = useState(null);

  if (!nodeData) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getNodeTypeBadge = () => {
    switch (nodeData.type) {
      case 'frontendNode':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded">Client SPA</span>;
      case 'apiNode':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">API Gateway</span>;
      case 'serviceNode':
        return <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono px-2 py-0.5 rounded">Backend Service</span>;
      case 'databaseNode':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded">Database Model</span>;
      case 'externalNode':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 rounded">External Service</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">System Component</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            {getNodeTypeBadge()}
            <span className="text-[11px] font-mono text-slate-400">ID: {nodeData.id}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">{nodeData.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Overview</h4>
        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800/80">
          {nodeData.description}
        </p>
      </div>

      {/* Responsibilities */}
      {nodeData.responsibilities?.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Core Responsibilities</h4>
          <ul className="text-xs space-y-1">
            {nodeData.responsibilities.map((resp, i) => (
              <li key={i} className="flex items-start space-x-2 text-slate-300">
                <span className="text-indigo-400 text-sm leading-none">•</span>
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target File Paths */}
      {nodeData.filePaths?.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target File Paths</h4>
          <div className="space-y-1">
            {nodeData.filePaths.map((fp, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs font-mono bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300 group"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{fp}</span>
                </div>
                <button
                  onClick={() => handleCopy(fp)}
                  className="p-1 hover:text-indigo-400 transition ml-2 flex-shrink-0"
                  title="Copy Path"
                >
                  {copiedPath === fp ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated APIs */}
      {nodeData.associatedApis?.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Associated REST APIs</h4>
          <div className="space-y-1.5">
            {nodeData.associatedApis.map((api, i) => (
              <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {api.method}
                  </span>
                  <span className="font-mono text-slate-200 text-[11px] truncate">{api.endpoint}</span>
                </div>
                <p className="text-[11px] text-slate-400">{api.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Schema Information */}
      {nodeData.associatedEntity && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Entity Schema ({nodeData.associatedEntity.name})
          </h4>
          <div className="bg-slate-950 rounded border border-slate-800 overflow-hidden text-xs">
            <div className="p-2 border-b border-slate-800 flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Primary Key: {nodeData.associatedEntity.primaryKey}</span>
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
              {(nodeData.associatedEntity.fields || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between py-0.5 text-[11px]">
                  <span className="font-mono text-amber-300/90">{f.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400">{f.type}</span>
                    {f.required && (
                      <span className="text-[9px] bg-rose-950 text-rose-400 px-1 rounded">Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main ArchitectureDiagram Component with Loading, Empty, and Error States
 */
const ArchitectureDiagram = ({ architecture, blueprint, isLoading = false, error = null, onRetry }) => {
  const [selectedNodeData, setSelectedNodeData] = useState(null);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[420px]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h4 className="text-sm font-semibold text-slate-200">Generating Architecture Visualizer...</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Analyzing project requirements and mapping out frontend clients, API routes, controllers, and database schemas.
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-slate-950 border border-rose-900/50 rounded-lg p-8 text-center flex flex-col items-center justify-center space-y-3 min-h-[360px]">
        <div className="p-3 bg-rose-950/60 text-rose-400 rounded-full border border-rose-800/80">
          <Info className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-rose-300">Architecture Diagram Error</h4>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Generation</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (!architecture && !blueprint) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-10 text-center flex flex-col items-center justify-center space-y-3 min-h-[360px]">
        <div className="p-3 bg-slate-900 text-indigo-400 rounded-full border border-slate-800">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">No Architecture Topology Defined</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Enter your system requirements and click "Generate Technical Blueprint" to automatically produce an interactive software architecture diagram.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visualizer Flow Workspace */}
      <ReactFlowProvider>
        <FlowCanvas
          architecture={architecture}
          blueprint={blueprint}
          onSelectNode={setSelectedNodeData}
          selectedNodeId={selectedNodeData?.id}
        />
      </ReactFlowProvider>

      {/* Selected Node Detail Inspector */}
      {selectedNodeData && (
        <NodeDetailPanel
          nodeData={selectedNodeData}
          onClose={() => setSelectedNodeData(null)}
          connections={architecture?.connections || []}
        />
      )}
    </div>
  );
};

export default ArchitectureDiagram;
