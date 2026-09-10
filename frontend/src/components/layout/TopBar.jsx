import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Bell, Plus, ExternalLink, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function TopBar({ onSearch, activeProjectName }) {
  const navigate = useNavigate();
  const [demoProjects, setDemoProjects] = useState([]);
  const [showDemos, setShowDemos] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Fetch demo projects for quick switcher
    axios.get('/api/projects')
      .then(res => {
        if (res.data?.projects) {
          const demos = res.data.projects.filter(p => p.isDemo);
          setDemoProjects(demos);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#07051a]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Active Project Breadcrumb / Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {activeProjectName ? (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Project</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {activeProjectName}
            </span>
          </div>
        ) : (
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search architecture, projects, APIs... (Ctrl + K)"
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Demo Projects Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowDemos(!showDemos)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Demo Blueprints</span>
          </button>

          {showDemos && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Pre-Generated Architectural Blueprints
              </div>
              <div className="py-1 space-y-1">
                {demoProjects.map((demo) => (
                  <button
                    key={demo._id}
                    onClick={() => {
                      setShowDemos(false);
                      navigate(`/workspace/${demo._id}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-300 flex items-center justify-between">
                      <span>{demo.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{demo.expectedScale || 'Cloud Native'}</div>
                  </button>
                ))}
                {demoProjects.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500">Loading demo blueprints...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute top-1.5 right-1.5"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50">
              <div className="text-xs font-semibold text-white mb-2">Platform Notifications</div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 flex gap-2 items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-200 font-medium">Gemini 1.5 Architecture Engine Active</div>
                    <div className="text-[10px] text-slate-400">Ready to synthesize multi-tier cloud blueprints.</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 flex gap-2 items-start">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-200 font-medium">Demo Blueprints Preloaded</div>
                    <div className="text-[10px] text-slate-400">Explore Food Delivery & E-Commerce systems instantly.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Project CTA */}
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>
    </header>
  );
}
