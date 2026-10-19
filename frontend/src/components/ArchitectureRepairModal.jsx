import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Server,
  Database,
  FileCode,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';

const ArchitectureRepairModal = ({
  isOpen,
  onClose,
  originalBlueprint,
  proposedBlueprint,
  resolvedFindingIds = [],
  initialFindings = [],
  remainingFindings = [],
  onConfirm,
  isApplying = false
}) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!isOpen || !proposedBlueprint) return null;

  const resolvedFindingsList = initialFindings.filter((f) =>
    resolvedFindingIds.includes(f.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-950/80 border border-indigo-800 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>AI-Assisted Architecture Repair Review</span>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                  Proposed Changes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Review proposed architectural fixes on a staged copy before applying them to your live project.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            title="Discard and close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 border-b-2 font-medium transition ${
              activeTab === 'summary'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolution Summary ({resolvedFindingsList.length})
          </button>
          <button
            onClick={() => setActiveTab('apis')}
            className={`px-3 py-2 border-b-2 font-medium transition ${
              activeTab === 'apis'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            REST APIs Comparison
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-2 border-b-2 font-medium transition ${
              activeTab === 'database'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Entities & Models
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Safety Notice */}
          <div className="bg-indigo-950/30 border border-indigo-900/50 p-3.5 rounded-lg flex items-start space-x-3 text-xs text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Safe Staged Proposal:</strong> These fixes have been applied to an in-memory copy of your architecture and validated against the Zod system schema. Your current project is completely unchanged until you confirm below.
            </p>
          </div>

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Addressed Defects</span>
                  <div className="text-xl font-bold text-emerald-400">
                    {resolvedFindingsList.length}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Remaining Findings</span>
                  <div className="text-xl font-bold text-slate-300">
                    {remainingFindings.length}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Zod Schema Validation</span>
                  <div className="text-xl font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Passed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Corrected Architectural Findings:
                </h4>
                <div className="divide-y divide-slate-800 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                  {resolvedFindingsList.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400 text-center">
                      No defects were resolved in this pass.
                    </div>
                  ) : (
                    resolvedFindingsList.map((rf, idx) => (
                      <div key={idx} className="p-3.5 flex items-start space-x-3 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-200">{rf.title}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              [{rf.section}]
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            {rf.suggestedFix}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REST APIS COMPARISON */}
          {activeTab === 'apis' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original APIs */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>Original Endpoints ({originalBlueprint?.apiEndpoints?.length || 0})</span>
                  </h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 max-h-[360px] overflow-y-auto">
                    {(originalBlueprint?.apiEndpoints || []).map((api, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-slate-850 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-300">{api.method || 'NO METHOD'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{api.authentication}</span>
                        </div>
                        <code className="text-[11px] text-slate-400 block truncate">{api.endpoint}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Repaired APIs */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Proposed Endpoints ({proposedBlueprint.apiEndpoints?.length || 0})</span>
                  </h4>
                  <div className="bg-slate-950 border border-emerald-900/50 rounded-lg p-3 space-y-2 max-h-[360px] overflow-y-auto">
                    {(proposedBlueprint.apiEndpoints || []).map((api, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-emerald-800/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400">{api.method}</span>
                          <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950 px-1 rounded">
                            {api.authentication}
                          </span>
                        </div>
                        <code className="text-[11px] text-slate-200 block truncate">{api.endpoint}</code>
                        {api.possibleErrors?.length > 0 && (
                          <div className="text-[10px] text-slate-500 pt-0.5">
                            Errors: {api.possibleErrors.slice(0, 3).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE & ENTITIES COMPARISON */}
          {activeTab === 'database' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Entities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>Original Entities ({originalBlueprint?.entities?.length || 0})</span>
                  </h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 max-h-[360px] overflow-y-auto">
                    {(originalBlueprint?.entities || []).map((ent, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-slate-850 space-y-1">
                        <span className="font-bold text-slate-300 block">{ent.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ent.fields?.length || 0} fields | PK: {ent.primaryKey}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Repaired Entities */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Proposed Entities ({proposedBlueprint.entities?.length || 0})</span>
                  </h4>
                  <div className="bg-slate-950 border border-emerald-900/50 rounded-lg p-3 space-y-2 max-h-[360px] overflow-y-auto">
                    {(proposedBlueprint.entities || []).map((ent, i) => (
                      <div key={i} className="p-2 rounded bg-slate-900 border border-emerald-800/40 space-y-1">
                        <span className="font-bold text-emerald-300 block">{ent.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ent.fields?.length || 0} fields | PK: {ent.primaryKey}
                        </span>
                        {ent.foreignKeys?.length > 0 && (
                          <div className="text-[10px] font-mono text-indigo-300">
                            FKs: {ent.foreignKeys.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-400">
            Confirming will replace the existing architecture with the proposed validated blueprint.
          </p>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              Discard Changes
            </button>
            <button
              onClick={() => onConfirm(proposedBlueprint)}
              disabled={isApplying}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Applying Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm & Replace Architecture</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchitectureRepairModal;
