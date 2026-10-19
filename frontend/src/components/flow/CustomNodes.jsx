import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Monitor, Server, Database, Cloud, Network, Cpu, ArrowUpRight } from 'lucide-react';

/**
 * Base Node Card Wrapper
 */
const BaseNodeCard = ({ selected, children, borderColor, glowColor }) => (
  <div
    className={`custom-drag-handle rounded-xl p-3.5 shadow-xl transition-all duration-200 cursor-pointer min-w-[210px] max-w-[260px] border ${borderColor} ${
      selected
        ? `ring-2 ring-indigo-400 shadow-2xl scale-[1.02] bg-slate-900`
        : `bg-slate-900/95 hover:border-indigo-400/70 hover:shadow-lg`
    }`}
    style={{
      boxShadow: selected ? `0 0 20px ${glowColor}` : 'none'
    }}
  >
    {children}
  </div>
);

/**
 * 1. Frontend Node (Client / Browser / SPA)
 */
export const FrontendNode = memo(({ data, selected }) => {
  return (
    <BaseNodeCard selected={selected} borderColor="border-cyan-500/40" glowColor="rgba(6, 182, 212, 0.25)">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
      />
      
      <div className="flex items-center space-x-2.5 mb-2">
        <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
          <Monitor className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
            CLIENT SPA
          </span>
          <h4 className="text-xs font-bold text-slate-100 truncate">{data.label}</h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-400">
        <span className="font-mono text-cyan-300/80">React 18 SPA</span>
        <span className="flex items-center text-indigo-400 font-medium">
          Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-slate-900"
      />
    </BaseNodeCard>
  );
});

/**
 * 2. API Gateway & Routing Node
 */
export const ApiNode = memo(({ data, selected }) => {
  return (
    <BaseNodeCard selected={selected} borderColor="border-emerald-500/40" glowColor="rgba(16, 185, 129, 0.25)">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center space-x-2.5 mb-2">
        <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
          <Network className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
            API GATEWAY
          </span>
          <h4 className="text-xs font-bold text-slate-100 truncate">{data.label}</h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-400">
        <span className="font-mono text-emerald-300/80">Express Router</span>
        <span className="flex items-center text-indigo-400 font-medium">
          Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-emerald-400 !border-2 !border-slate-900"
      />
    </BaseNodeCard>
  );
});

/**
 * 3. Backend Service & Controller Node
 */
export const ServiceNode = memo(({ data, selected }) => {
  return (
    <BaseNodeCard selected={selected} borderColor="border-indigo-500/40" glowColor="rgba(99, 102, 241, 0.25)">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center space-x-2.5 mb-2">
        <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
            SERVICE LOGIC
          </span>
          <h4 className="text-xs font-bold text-slate-100 truncate">{data.label}</h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-400">
        <span className="font-mono text-indigo-300/80">Controller</span>
        <span className="flex items-center text-indigo-400 font-medium">
          Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900"
      />
    </BaseNodeCard>
  );
});

/**
 * 4. Database Model & Storage Node
 */
export const DatabaseNode = memo(({ data, selected }) => {
  return (
    <BaseNodeCard selected={selected} borderColor="border-amber-500/40" glowColor="rgba(245, 158, 11, 0.25)">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center space-x-2.5 mb-2">
        <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
          <Database className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
            DATABASE
          </span>
          <h4 className="text-xs font-bold text-slate-100 truncate">{data.label}</h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-400">
        <span className="font-mono text-amber-300/80">
          {data.associatedEntity ? `${data.associatedEntity.fields?.length || 0} Fields` : 'Mongoose ODM'}
        </span>
        <span className="flex items-center text-indigo-400 font-medium">
          Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-900"
      />
    </BaseNodeCard>
  );
});

/**
 * 5. External Services Node (Payment, Auth, Cloud, Third-Party)
 */
export const ExternalNode = memo(({ data, selected }) => {
  return (
    <BaseNodeCard selected={selected} borderColor="border-rose-500/40" glowColor="rgba(244, 63, 94, 0.25)">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-rose-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center space-x-2.5 mb-2">
        <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400">
          <Cloud className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold block">
            EXTERNAL SERVICE
          </span>
          <h4 className="text-xs font-bold text-slate-100 truncate">{data.label}</h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
        {data.description}
      </p>

      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-400">
        <span className="font-mono text-rose-300/80">Integration</span>
        <span className="flex items-center text-indigo-400 font-medium">
          Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-rose-400 !border-2 !border-slate-900"
      />
    </BaseNodeCard>
  );
});

export const nodeTypes = {
  frontendNode: FrontendNode,
  apiNode: ApiNode,
  serviceNode: ServiceNode,
  databaseNode: DatabaseNode,
  externalNode: ExternalNode
};
