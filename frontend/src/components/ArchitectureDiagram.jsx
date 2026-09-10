import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Monitor, Layers, Server, Database, Cloud, ArrowRight } from 'lucide-react';

const ArchitectureDiagram = ({ architecture }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!architecture) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-md p-6 text-center text-slate-400 text-xs">
        No system architecture data available.
      </div>
    );
  }

  const nodes = architecture.nodes || [
    { id: 'client', label: 'User Browser', type: 'user', description: 'Web Client' },
    { id: 'frontend', label: 'React SPA Frontend', type: 'frontend', description: 'React 18 & Tailwind' },
    { id: 'api', label: 'REST API Gateway', type: 'api', description: 'Express Routes' },
    { id: 'server', label: 'Express Controllers', type: 'backend', description: 'Business Logic & JWT' },
    { id: 'database', label: 'MongoDB Database', type: 'database', description: 'Mongoose ODM Documents' }
  ];

  const connections = architecture.connections || [
    { from: 'client', to: 'frontend', label: 'UI Action' },
    { from: 'frontend', to: 'api', label: 'HTTP Request (JWT)' },
    { from: 'api', to: 'server', label: 'Express Router' },
    { from: 'server', to: 'database', label: 'Mongoose Query' }
  ];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'user': return <Monitor className="w-5 h-5 text-indigo-400" />;
      case 'frontend': return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'api': return <Server className="w-5 h-5 text-emerald-400" />;
      case 'backend': return <Server className="w-5 h-5 text-indigo-400" />;
      case 'database': return <Database className="w-5 h-5 text-amber-400" />;
      case 'external': return <Cloud className="w-5 h-5 text-rose-400" />;
      default: return <Server className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden space-y-4">
      {/* Interactive Controls Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Interactive System Architecture Flow</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition border border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition border border-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition border border-slate-700 text-xs px-2"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Diagram Workspace Canvas */}
      <div
        className="p-8 overflow-hidden cursor-grab active:cursor-grabbing min-h-[340px] flex items-center justify-center select-none bg-slate-950/80"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-w-full"
        >
          {nodes.map((node, idx) => (
            <React.Fragment key={node.id || idx}>
              {/* Node Card */}
              <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/80 p-4 rounded-lg shadow-lg min-w-[170px] max-w-[210px] space-y-2 transition group">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition">
                      {node.label}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {node.type}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {node.description}
                </p>
              </div>

              {/* Arrow Connector */}
              {idx < nodes.length - 1 && (
                <div className="flex flex-col items-center justify-center text-slate-500 px-1">
                  <span className="text-[10px] font-mono text-slate-500 max-w-[90px] text-center mb-1 line-clamp-1">
                    {connections[idx]?.label || 'Flow'}
                  </span>
                  <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
