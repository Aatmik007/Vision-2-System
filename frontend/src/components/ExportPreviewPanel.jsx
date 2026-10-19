import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code2,
  Box,
  Server,
  Database,
  FolderTree,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  generateExportFilename,
  generateArchitectureExportBundle,
  safeSerializeJson,
  downloadFile,
  copyToClipboard
} from '../utils/exportGenerator';
import { generateArchitectureMarkdown } from '../utils/markdownGenerator';

const ExportPreviewPanel = ({ project, findings = [], summary = null }) => {
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'markdown'
  const [markdownViewMode, setMarkdownViewMode] = useState('raw'); // 'raw' | 'rendered'
  const [copyStatus, setCopyStatus] = useState(null); // 'json' | 'markdown' | null
  const [downloadStatus, setDownloadStatus] = useState(null); // 'json' | 'markdown' | null
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const blueprint = project?.generatedBlueprint;

  // Build JSON bundle and serialized text
  const exportBundle = useMemo(() => {
    return generateArchitectureExportBundle(project, findings, summary);
  }, [project, findings, summary]);

  const serializedJsonResult = useMemo(() => {
    return safeSerializeJson(exportBundle, 2);
  }, [exportBundle]);

  // Build Markdown text
  const markdownText = useMemo(() => {
    return generateArchitectureMarkdown(blueprint, project?.name || 'System Architecture', {
      project,
      findings,
      summary
    });
  }, [blueprint, project, findings, summary]);

  const jsonFilename = useMemo(() => {
    return generateExportFilename(project?.name, 'json');
  }, [project?.name]);

  const mdFilename = useMemo(() => {
    return generateExportFilename(project?.name, 'md');
  }, [project?.name]);

  const jsonSizeKB = useMemo(() => {
    const bytes = new Blob([serializedJsonResult.json || '']).size;
    return (bytes / 1024).toFixed(1);
  }, [serializedJsonResult.json]);

  const mdSizeKB = useMemo(() => {
    const bytes = new Blob([markdownText]).size;
    return (bytes / 1024).toFixed(1);
  }, [markdownText]);

  // Download Handlers
  const handleDownloadJson = () => {
    setErrorMessage(null);
    if (!serializedJsonResult.success || !serializedJsonResult.json) {
      setErrorMessage(`Serialization error: ${serializedJsonResult.error || 'Failed to serialize JSON'}`);
      return;
    }
    const result = downloadFile(serializedJsonResult.json, jsonFilename, 'application/json');
    if (result.success) {
      setDownloadStatus('json');
      setFeedbackMessage(`Downloaded ${jsonFilename} successfully!`);
      setTimeout(() => {
        setDownloadStatus(null);
        setFeedbackMessage(null);
      }, 3500);
    } else {
      setErrorMessage(result.error || 'Failed to initiate download.');
    }
  };

  const handleDownloadMarkdown = () => {
    setErrorMessage(null);
    const result = downloadFile(markdownText, mdFilename, 'text/markdown');
    if (result.success) {
      setDownloadStatus('markdown');
      setFeedbackMessage(`Downloaded ${mdFilename} successfully!`);
      setTimeout(() => {
        setDownloadStatus(null);
        setFeedbackMessage(null);
      }, 3500);
    } else {
      setErrorMessage(result.error || 'Failed to initiate download.');
    }
  };

  // Copy Handlers
  const handleCopy = async (type) => {
    setErrorMessage(null);
    const textToCopy = type === 'json' ? serializedJsonResult.json : markdownText;
    if (!textToCopy) {
      setErrorMessage('Content is empty or unavailable.');
      return;
    }

    const result = await copyToClipboard(textToCopy);
    if (result.success) {
      setCopyStatus(type);
      setFeedbackMessage(`Copied ${type.toUpperCase()} content to clipboard!`);
      setTimeout(() => {
        setCopyStatus(null);
        setFeedbackMessage(null);
      }, 2500);
    } else {
      setErrorMessage(result.error || 'Failed to copy to clipboard.');
    }
  };

  if (!blueprint) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-400">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-200">No Architecture Blueprint Generated Yet</h3>
        <p className="text-xs text-slate-400 mt-1">
          Generate an AI architecture blueprint first to enable reliable JSON and Markdown exports.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <span>Architecture Export & Technical Specifications</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Preview, copy, and download the full validated architecture bundle matching the current project state.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadJson}
            disabled={!serializedJsonResult.success}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-medium transition shadow-sm"
            title="Download complete structured architecture JSON"
          >
            {downloadStatus === 'json' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Downloaded JSON</span>
              </>
            ) : (
              <>
                <FileJson className="w-3.5 h-3.5" />
                <span>Download JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition"
            title="Download formatted GitHub Markdown specification"
          >
            {downloadStatus === 'markdown' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Downloaded MD</span>
              </>
            ) : (
              <>
                <FileCode className="w-3.5 h-3.5" />
                <span>Download .MD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback & Error Banners */}
      {feedbackMessage && (
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-md text-xs transition">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-md text-xs transition">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Package Contents Badges */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-2">
        <div className="text-[11px] font-medium text-slate-400 flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Package Bundles All 7 Core System Artifacts:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center space-x-1 bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-750">
            <Box className="w-3 h-3 text-indigo-400" />
            <span>Modules ({exportBundle.modules?.length || 0})</span>
          </span>
          <span className="inline-flex items-center space-x-1 bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-750">
            <Server className="w-3 h-3 text-emerald-400" />
            <span>REST APIs ({exportBundle.apiEndpoints?.length || 0})</span>
          </span>
          <span className="inline-flex items-center space-x-1 bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-750">
            <Database className="w-3 h-3 text-amber-400" />
            <span>Schemas ({exportBundle.databaseSchemas?.length || 0})</span>
          </span>
          <span className="inline-flex items-center space-x-1 bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-750">
            <FolderTree className="w-3 h-3 text-cyan-400" />
            <span>File Manifest ({exportBundle.fileDescriptions?.length || 0} files)</span>
          </span>
          <span className="inline-flex items-center space-x-1 bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-750">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Consistency Findings ({findings.length})</span>
          </span>
        </div>
      </div>

      {/* Format Switcher Tabs & In-Tab Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Format Selector Pills */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Bundle ({jsonSizeKB} KB)</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'markdown'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Markdown Spec ({mdSizeKB} KB)</span>
          </button>
        </div>

        {/* View Options & Copy Action */}
        <div className="flex items-center space-x-2">
          {activeTab === 'markdown' && (
            <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setMarkdownViewMode('raw')}
                className={`px-2 py-1 rounded flex items-center space-x-1 text-[11px] ${
                  markdownViewMode === 'raw' ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Raw Markdown</span>
              </button>
              <button
                onClick={() => setMarkdownViewMode('rendered')}
                className={`px-2 py-1 rounded flex items-center space-x-1 text-[11px] ${
                  markdownViewMode === 'rendered' ? 'bg-slate-800 text-slate-200 font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Visual Layout</span>
              </button>
            </div>
          )}

          <button
            onClick={() => handleCopy(activeTab)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition"
            title={`Copy full ${activeTab.toUpperCase()} content to clipboard`}
          >
            {copyStatus === activeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy {activeTab.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Filename Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950 px-3.5 py-2 rounded-t-lg border-t border-x border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          <span className="text-slate-300">{activeTab === 'json' ? jsonFilename : mdFilename}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="text-slate-500">
            {activeTab === 'json' ? 'RFC 8259 Standard Valid JSON' : 'GitHub Flavored Markdown (GFM)'}
          </span>
          <span className="text-slate-400 font-semibold">{activeTab === 'json' ? `${jsonSizeKB} KB` : `${mdSizeKB} KB`}</span>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-b-lg -mt-6 p-4 max-h-[640px] overflow-y-auto font-mono text-xs select-text">
        {activeTab === 'json' && (
          <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {serializedJsonResult.json || serializedJsonResult.error}
          </pre>
        )}

        {activeTab === 'markdown' && markdownViewMode === 'raw' && (
          <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {markdownText}
          </pre>
        )}

        {activeTab === 'markdown' && markdownViewMode === 'rendered' && (
          <div className="font-sans text-sm text-slate-200 space-y-6 py-2 px-1">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-xl font-bold text-white mb-2">Technical Architecture Blueprint: {project?.name}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                <span>Stack: <strong className="text-indigo-400">{project?.preferredStack || 'MERN'}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-slate-200">{project?.projectType || 'Web App'}</strong></span>
                <span>•</span>
                <span>Files: <strong className="text-slate-200">{exportBundle.fileDescriptions?.length || 0}</strong></span>
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-indigo-300 mb-2">Executive Overview & Problem Statement</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{blueprint.overview}</p>
              {blueprint.problemStatement && (
                <p className="text-xs text-slate-400 mt-2 bg-slate-900 p-3 rounded border border-slate-800">
                  <strong className="text-slate-300">Problem Statement: </strong>{blueprint.problemStatement}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-indigo-300 mb-2">System Modules ({exportBundle.modules?.length || 0})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exportBundle.modules?.map((mod, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded">
                    <div className="font-semibold text-xs text-white flex items-center justify-between">
                      <span>{mod.name}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">{mod.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{mod.description}</p>
                    {mod.filePaths?.length > 0 && (
                      <div className="mt-2 text-[11px] text-indigo-400 font-mono">
                        {mod.filePaths.slice(0, 2).join(', ')}
                        {mod.filePaths.length > 2 && ` +${mod.filePaths.length - 2} more`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-indigo-300 mb-2">File Descriptions & Manifest ({exportBundle.fileDescriptions?.length || 0})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Path</th>
                      <th className="p-2 border-b border-slate-800">Type</th>
                      <th className="p-2 border-b border-slate-800">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {exportBundle.fileDescriptions?.slice(0, 15).map((f, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="p-2 font-mono text-indigo-300">{f.path}</td>
                        <td className="p-2 text-slate-400 font-mono text-[11px]">{f.type}</td>
                        <td className="p-2 text-slate-300">{f.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {exportBundle.fileDescriptions?.length > 15 && (
                  <div className="text-[11px] text-slate-500 text-center py-2">
                    Showing 15 of {exportBundle.fileDescriptions.length} documented files. Switch to Raw Markdown or download to inspect all.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-indigo-300 mb-2">Architecture Consistency & Conformance</h2>
              <div className="bg-slate-900 p-3 rounded border border-slate-800 text-xs">
                <div className="font-medium text-slate-200">
                  Status: {findings.length === 0 ? '✅ Architecturally Consistent' : `⚠️ ${findings.length} Findings Detected`}
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  All consistency findings are systematically included in the exported JSON and Markdown specifications.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPreviewPanel;
