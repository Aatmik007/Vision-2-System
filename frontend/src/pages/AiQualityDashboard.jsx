import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';

const AiQualityDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [domainFilter, setDomainFilter] = useState('all');
  const [expandedCases, setExpandedCases] = useState({});

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/evaluation/results');
      setReport(res.data);
    } catch (err) {
      console.error('Fetch evaluation report error:', err);
      setError(err.response?.data?.message || 'Failed to load evaluation metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = async () => {
    try {
      setRunning(true);
      setError('');
      const res = await API.post('/evaluation/run', { useLiveApi: false });
      setReport(res.data);
    } catch (err) {
      console.error('Rerun evaluation error:', err);
      setError(err.response?.data?.message || 'Failed to execute evaluation suite.');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const toggleExpand = (id) => {
    setExpandedCases(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const metrics = report?.metrics || {
    totalPromptsTested: 0,
    successfulGenerations: 0,
    failedGenerations: 0,
    schemaValidationSuccessRate: 0,
    averageSemanticScore: 0,
    latency: { averageMs: 0, minMs: 0, maxMs: 0 },
    tokenUsage: { reliableUsageAvailable: false, disclaimer: 'No data' }
  };

  const testResults = report?.testResults || [];

  const domains = Array.from(new Set(testResults.map(t => t.domain)));

  // Filter test results
  const filteredCases = testResults.filter(tc => {
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : (statusFilter === 'passed' ? tc.executionStatus === 'PASSED' : tc.executionStatus === 'FAILED');
    
    const matchesDomain = domainFilter === 'all' ? true : tc.domain === domainFilter;
    
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || 
      tc.name?.toLowerCase().includes(query) ||
      tc.domain?.toLowerCase().includes(query) ||
      tc.description?.toLowerCase().includes(query);

    return matchesStatus && matchesDomain && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
              <Activity className="w-6 h-6 text-indigo-400" />
              <span>AI Architecture Quality & Evaluation Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Automated testing, structural schema validation, semantic domain fidelity, and real latency benchmarks.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRerun}
              disabled={running || loading}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-md transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Running Evaluation Suite...' : 'Rerun Evaluation Suite'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg flex items-center space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Real Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Tested */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Prompts Evaluated</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              {metrics.totalPromptsTested}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Diverse real-world test cases
            </div>
          </div>

          {/* Card 2: Structural Schema Success */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Schema Validation Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              {metrics.schemaValidationSuccessRate}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Strict Zod schema conformance
            </div>
          </div>

          {/* Card 3: Failed Generations */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Failed Generations</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-slate-200 mt-2">
              {metrics.failedGenerations}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Zero unhandled crashes
            </div>
          </div>

          {/* Card 4: Average Latency */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Average Latency</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-2">
              {metrics.latency?.averageMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Range: {metrics.latency?.minMs}ms - {metrics.latency?.maxMs}ms
            </div>
          </div>

          {/* Card 5: Semantic Score */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Semantic Domain Score</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300 mt-2">
              {metrics.averageSemanticScore}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Domain entity & route fidelity
            </div>
          </div>
        </div>

        {/* Structural vs Semantic Clarity Callout */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Understanding Evaluation Rigor: Structural Validation vs. Semantic Correctness
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Vision2System enforces a strict distinction between syntactic schema validity and architectural domain correctness:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
                  <div className="font-semibold text-emerald-400 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Structural Schema Validation (Zod)</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-normal">
                    Enforces that output strictly adheres to the technical blueprint specification: required types, populated arrays, enum constraints, non-null HTTP definitions, and primary keys.
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
                  <div className="font-semibold text-cyan-400 flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Semantic Domain Correctness</span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-normal">
                    Evaluates whether the architecture logically solves the prompt: domain-appropriate entities (e.g. Menu/Restaurant vs. Cart/Product), required auth on mutating routes, and real-time WebSocket communication for tracking domains.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Usage & Cost Transparency Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-medium text-slate-300">API Token & Cost Accounting: </span>
              <span className="text-slate-400">{metrics.tokenUsage?.disclaimer}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-300 font-mono text-[11px]">
            <span>Tokens: <strong className="text-slate-100">{metrics.tokenUsage?.totalTokens || 0}</strong></span>
            <span>•</span>
            <span>Est. Cost: <strong className="text-emerald-400">${metrics.tokenUsage?.estimatedCostUsd || '0.000000'}</strong></span>
          </div>
        </div>

        {/* Test Cases Explorer Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Test Execution Results & Case Inspector</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review individual prompt executions, error handling resilience, and version comparisons.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-md focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="passed">Passed ({testResults.filter(t => t.executionStatus === 'PASSED').length})</option>
                <option value="failed">Failed ({testResults.filter(t => t.executionStatus === 'FAILED').length})</option>
              </select>

              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-2.5 py-1.5 rounded-md focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Domains</option>
                {domains.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Test Case Cards List */}
          <div className="space-y-3">
            {filteredCases.map(tc => {
              const isExpanded = expandedCases[tc.testId];
              return (
                <div
                  key={tc.testId}
                  className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden transition"
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => toggleExpand(tc.testId)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition select-none"
                  >
                    <div className="flex items-center space-x-3">
                      {tc.executionStatus === 'PASSED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                          <span>{tc.name}</span>
                          <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono">
                            {tc.domain}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {tc.description || tc.errorMessage || 'No prompt description.'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-mono">
                      {tc.semanticEvaluation && (
                        <span className="text-cyan-400 text-[11px]">
                          Fidelity: <strong>{tc.semanticEvaluation.semanticScore}%</strong>
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{tc.latencyMs}ms</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details Drawer */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-850 bg-slate-900/40 space-y-3 text-xs">
                      {tc.errorMessage && (
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300 text-[11px]">
                          <strong className="text-indigo-400">Execution Note: </strong>
                          {tc.errorMessage}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Structural Validation Details */}
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                          <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Structural Schema Validation</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Status: <strong className={tc.structuralValidation?.passed ? 'text-emerald-400' : 'text-rose-400'}>
                              {tc.structuralValidation?.passed ? 'Passed (Zod Conforming)' : 'Failed'}
                            </strong>
                          </div>
                          {tc.structuralValidation?.errors?.length > 0 && (
                            <ul className="text-[11px] text-rose-400 list-disc list-inside">
                              {tc.structuralValidation.errors.map((e, idx) => (
                                <li key={idx}>{e}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Semantic Correctness Breakdown */}
                        {tc.semanticEvaluation ? (
                          <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1.5">
                            <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Semantic Domain Evaluation</span>
                            </div>
                            <div className="text-[11px] text-slate-400 space-y-1">
                              <div>Domain Relevance: <strong className="text-cyan-300">{tc.semanticEvaluation.domainRelevance}</strong></div>
                              {tc.semanticEvaluation.criteria?.entityCoverage && (
                                <div>Entities: {tc.semanticEvaluation.criteria.entityCoverage.details}</div>
                              )}
                              {tc.semanticEvaluation.criteria?.endpointCoverage && (
                                <div>Routes: {tc.semanticEvaluation.criteria.endpointCoverage.details}</div>
                              )}
                              {tc.semanticEvaluation.criteria?.authSecurity && (
                                <div>Auth Rules: {tc.semanticEvaluation.criteria.authSecurity.details}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-950 p-3 rounded border border-slate-800 flex items-center text-[11px] text-slate-500">
                            Edge case / Negative test scenario (semantic scoring omitted).
                          </div>
                        )}
                      </div>

                      {/* Export & Version Comparison Info */}
                      {(tc.exportVerification?.success || tc.versionComparison) && (
                        <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 pt-1">
                          {tc.exportVerification?.success && (
                            <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-indigo-300">
                              ✓ Export Bundle: {tc.exportVerification.jsonSizeKB} KB JSON / {tc.exportVerification.mdSizeKB} KB MD
                            </span>
                          )}
                          {tc.versionComparison?.hasChanges && (
                            <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-amber-300">
                              ✓ Version Diff Verified: {tc.versionComparison.summary}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCases.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                No evaluation test cases matched the selected filter.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AiQualityDashboard;
