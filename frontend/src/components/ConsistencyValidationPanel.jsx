import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ConsistencyValidationPanel = ({
  findings = [],
  summary = { total: 0, errors: 0, warnings: 0, info: 0, isConsistent: true },
  onSelectFinding,
  onNavigateSection,
  onRequestRepair,
  isRepairing = false,
  onRefresh,
  isValidating = false
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedFindingIds, setSelectedFindingIds] = useState(
    findings.map((f) => f.id)
  );
  const [expandedFindingId, setExpandedFindingId] = useState(null);

  // Sync selected finding IDs when findings change
  React.useEffect(() => {
    setSelectedFindingIds(findings.map((f) => f.id));
  }, [findings]);

  const filteredFindings = findings.filter((f) => {
    if (activeFilter === 'all') return true;
    return f.severity === activeFilter;
  });

  const toggleSelectAll = () => {
    if (selectedFindingIds.length === findings.length) {
      setSelectedFindingIds([]);
    } else {
      setSelectedFindingIds(findings.map((f) => f.id));
    }
  };

  const toggleSelectFinding = (id) => {
    setSelectedFindingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'error':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-400 border border-rose-800">
            <AlertCircle className="w-3 h-3 mr-0.5" />
            <span>Error</span>
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-0.5" />
            <span>Warning</span>
          </span>
        );
      case 'info':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-950/80 text-sky-400 border border-sky-800">
            <Info className="w-3 h-3 mr-0.5" />
            <span>Suggestion</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
      {/* Header and Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Architecture Consistency & Integrity Validation
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects duplicate endpoints, broken relationships, inconsistent schemas, unprotected routes, and missing error definitions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isValidating}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-xs transition"
              title="Re-run consistency analysis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
              <span>Re-Analyze</span>
            </button>
          )}

          {findings.length > 0 && onRequestRepair && (
            <button
              onClick={() => onRequestRepair(selectedFindingIds)}
              disabled={isRepairing || selectedFindingIds.length === 0}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded text-xs shadow-lg shadow-indigo-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isRepairing
                  ? 'Generating AI Fix...'
                  : `Fix Selected (${selectedFindingIds.length})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Security & Conformance Disclaimer Notice */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-lg text-xs text-slate-400 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-semibold text-slate-300">Auditing Disclaimer:</span> Automated consistency validation enforces structural integrity, schema cohesion, and relationship contracts across your architecture. While it detects common misconfigurations, automated validation does not guarantee comprehensive production security or performance readiness.
        </div>
      </div>

      {/* Metric Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Status</span>
          <div className="flex items-center space-x-1.5">
            {summary.isConsistent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">Consistent</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-rose-400">Defects Found</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setActiveFilter('error')}
          className={`bg-slate-950 p-3.5 rounded-lg text-left space-y-1 transition border ${
            activeFilter === 'error' ? 'border-rose-500/70 bg-rose-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400">Errors</span>
          <div className="text-base font-bold text-slate-100">{summary.errors}</div>
        </button>

        <button
          onClick={() => setActiveFilter('warning')}
          className={`bg-slate-950 p-3.5 rounded-lg text-left space-y-1 transition border ${
            activeFilter === 'warning' ? 'border-amber-500/70 bg-amber-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">Warnings</span>
          <div className="text-base font-bold text-slate-100">{summary.warnings}</div>
        </button>

        <button
          onClick={() => setActiveFilter('info')}
          className={`bg-slate-950 p-3.5 rounded-lg text-left space-y-1 transition border ${
            activeFilter === 'info' ? 'border-sky-500/70 bg-sky-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">Suggestions</span>
          <div className="text-base font-bold text-slate-100">{summary.info}</div>
        </button>
      </div>

      {/* Filter Toolbar & Multi-Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            All Findings ({findings.length})
          </button>
          <button
            onClick={() => setActiveFilter('error')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeFilter === 'error'
                ? 'bg-rose-600 text-white font-medium'
                : 'text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800'
            }`}
          >
            Errors ({summary.errors})
          </button>
          <button
            onClick={() => setActiveFilter('warning')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeFilter === 'warning'
                ? 'bg-amber-600 text-white font-medium'
                : 'text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800'
            }`}
          >
            Warnings ({summary.warnings})
          </button>
          <button
            onClick={() => setActiveFilter('info')}
            className={`px-2.5 py-1 rounded transition text-xs ${
              activeFilter === 'info'
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-400 hover:text-sky-400 bg-slate-950 border border-slate-800'
            }`}
          >
            Suggestions ({summary.info})
          </button>
        </div>

        {findings.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            {selectedFindingIds.length === findings.length ? (
              <CheckSquare className="w-4 h-4 text-indigo-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All for Repair</span>
          </button>
        )}
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-200">
              No {activeFilter === 'all' ? '' : activeFilter} consistency issues detected
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your API endpoints, database entities, foreign keys, and error specifications are structurally aligned.
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isSelected = selectedFindingIds.includes(finding.id);
            const isExpanded = expandedFindingId === finding.id;

            return (
              <div
                key={finding.id}
                className={`bg-slate-950 border rounded-lg p-4 space-y-3 transition ${
                  finding.severity === 'error'
                    ? 'border-rose-900/60 hover:border-rose-600/80'
                    : finding.severity === 'warning'
                    ? 'border-amber-900/60 hover:border-amber-600/80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleSelectFinding(finding.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-400 transition flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getSeverityBadge(finding.severity)}
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          Section: {finding.section}
                        </span>
                        {finding.targetItem && (
                          <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                            {finding.targetItem}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-100">{finding.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {finding.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    {finding.section && onNavigateSection && (
                      <button
                        onClick={() => onNavigateSection(finding.section, finding.targetNodeId)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded border border-slate-800 text-xs inline-flex items-center space-x-1"
                        title={`Navigate to ${finding.section}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[10px]">Inspect</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-900"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Suggested Fix Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-850 space-y-2 text-xs bg-slate-900/60 p-3 rounded">
                    <div className="flex items-start space-x-2 text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-400" />
                      <div>
                        <span className="font-semibold block text-slate-200">Recommended Resolution:</span>
                        <p className="text-slate-400 mt-0.5">{finding.suggestedFix}</p>
                      </div>
                    </div>

                    {finding.targetNodeId && (
                      <div className="text-[11px] font-mono text-slate-500 pt-1">
                        Diagram Node Target: <code className="text-indigo-400 font-semibold">{finding.targetNodeId}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConsistencyValidationPanel;
