import React, { useState } from 'react';
import { Layout, Box, Server, Database, ListOrdered, CheckCircle2, Copy, Check } from 'lucide-react';

const PlanViewer = ({ plan }) => {
  const [activeTab, setActiveTab] = useState('steps');
  const [copied, setCopied] = useState(false);

  if (!plan || !plan.developmentSteps || plan.developmentSteps.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-slate-400">
        No implementation plan generated yet. Click "Generate Implementation Plan" above to create one.
      </div>
    );
  }

  const tabs = [
    { id: 'steps', label: 'Development Steps', icon: ListOrdered },
    { id: 'pages', label: 'Pages & Views', icon: Layout },
    { id: 'components', label: 'React Components', icon: Box },
    { id: 'backend', label: 'API & Backend', icon: Server },
    { id: 'database', label: 'Database Schema', icon: Database }
  ];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header Bar */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Generated Implementation Plan</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Generated on {new Date(plan.generatedAt || Date.now()).toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleCopyJson}
          className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded transition border border-slate-700 font-medium"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'steps' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Step-by-Step Execution Plan</h4>
            {plan.developmentSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-950 rounded border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-200">{step}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Suggested Frontend Pages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.pages.map((page, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center space-x-3">
                  <Layout className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-mono text-slate-200">{page}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Modular React Components</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.components.map((comp, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center space-x-3">
                  <Box className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-mono text-slate-200">{comp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'backend' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Frontend Requirements</h4>
              <ul className="space-y-2">
                {(plan.frontendRequirements || []).map((req, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                    • {req}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2">Backend & API Requirements</h4>
              <ul className="space-y-2">
                {(plan.backendRequirements || []).map((req, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                    • {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Database Entities & Collections</h4>
            <div className="space-y-2">
              {(plan.databaseRequirements || []).map((dbReq, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center space-x-3">
                  <Database className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-sm font-mono text-slate-200">{dbReq}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanViewer;
