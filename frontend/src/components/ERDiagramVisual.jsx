import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Database, Key, Link2 } from 'lucide-react';

const ERDiagramVisual = ({ entities = [], relationships = [] }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!entities || entities.length === 0) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-md p-6 text-center text-slate-400 text-xs">
        No entity relationship data available.
      </div>
    );
  }

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

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden space-y-4">
      {/* Interactive Controls Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Database className="w-4 h-4 text-amber-400" />
          <span>Interactive ER Diagram (Entity Relationships)</span>
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

      {/* Relationships Summary Header */}
      {relationships && relationships.length > 0 && (
        <div className="px-6 pt-2 flex flex-wrap gap-2">
          {relationships.map((rel, idx) => (
            <div
              key={idx}
              className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full"
            >
              <span className="font-semibold text-amber-400">{rel.from}</span>
              <span className="bg-amber-950 text-amber-300 px-1.5 py-0.2 text-[10px] font-mono rounded border border-amber-900 font-bold">
                {rel.type || '1:N'}
              </span>
              <span className="font-semibold text-indigo-400">{rel.to}</span>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Diagram Workspace Canvas */}
      <div
        className="p-8 overflow-hidden cursor-grab active:cursor-grabbing min-h-[380px] flex items-center justify-center select-none bg-slate-950/80"
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
          className="flex flex-wrap items-start justify-center gap-8 max-w-full"
        >
          {entities.map((entity, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/80 rounded-lg shadow-xl min-w-[240px] max-w-[280px] overflow-hidden transition group"
            >
              {/* Entity Title Header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition font-mono">
                    {entity.name}
                  </h4>
                </div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  Collection
                </span>
              </div>

              {/* Fields Table List */}
              <div className="p-3 space-y-1.5 divide-y divide-slate-800/40 text-xs">
                {(entity.fields || []).map((field, fIdx) => (
                  <div key={fIdx} className="pt-1.5 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5 font-mono">
                      {field.name === '_id' || field.name.endsWith('Id') || field.name === 'id' ? (
                        <Key className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      ) : (
                        <span className="w-3 text-center text-slate-600 font-bold">•</span>
                      )}
                      <span className={field.name === '_id' ? 'text-amber-300 font-semibold' : 'text-slate-200'}>
                        {field.name}
                      </span>
                    </div>

                    <span className="font-mono text-slate-500 text-[10px]">
                      {field.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ERDiagramVisual;
