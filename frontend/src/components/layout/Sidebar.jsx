import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Network,
  Database,
  Terminal,
  ShieldCheck,
  Milestone,
  GitBranch,
  ShieldAlert,
  Settings,
  LogOut,
  Cpu,
  Layers
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function Sidebar({ activeProjectId }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Project', path: '/projects/new', icon: PlusCircle, highlight: true },
    { name: 'GitHub Analyzer', path: '/analyzer', icon: GitBranch },
  ];

  // Project workspace deep links
  const workspaceTabs = activeProjectId ? [
    { name: 'Architecture', path: `/workspace/${activeProjectId}?tab=architecture`, icon: Network },
    { name: 'ER Diagram', path: `/workspace/${activeProjectId}?tab=er`, icon: Database },
    { name: 'API Explorer', path: `/workspace/${activeProjectId}?tab=apis`, icon: Terminal },
    { name: 'Security Posture', path: `/workspace/${activeProjectId}?tab=security`, icon: ShieldCheck },
    { name: 'Roadmap', path: `/workspace/${activeProjectId}?tab=roadmap`, icon: Milestone },
    { name: 'AI Review', path: `/workspace/${activeProjectId}?tab=review`, icon: Cpu },
  ] : [];

  return (
    <aside className="w-64 bg-[#07051a] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                Vision<span className="text-cyan-400">2</span>System
              </span>
              <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">ARCHITECT WORKSPACE</span>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Core Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  item.highlight
                    ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
                    : isActive
                    ? 'bg-slate-800/80 text-white border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Active Blueprint Subsections */}
          {activeProjectId && (
            <div className="pt-4">
              <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Blueprint</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="space-y-0.5">
                {workspaceTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname + location.search === tab.path;
                  return (
                    <NavLink
                      key={tab.name}
                      to={tab.path}
                      className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/50'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tab.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin Navigation */}
          {user?.role === 'admin' && (
            <div className="pt-4">
              <div className="px-3 pb-2 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                Administration
              </div>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-600/40'
                      : 'text-slate-400 hover:text-amber-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Footer Profile Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                <span>{user?.name || 'User'}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                  user?.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {user?.role || 'user'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
