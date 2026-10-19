import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Plus, LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2 text-indigo-400 font-bold text-xl hover:text-indigo-300 transition">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>Vision2System</span>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-md transition"
                >
                  Dashboard
                </Link>

                <Link
                  to="/quality-dashboard"
                  className="text-slate-300 hover:text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 rounded-md transition flex items-center space-x-1"
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">AI Quality</span>
                </Link>

                <Link
                  to="/projects/new"
                  className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium px-2.5 sm:px-3.5 py-1.5 rounded-md transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">+ New Project</span>
                </Link>

                <div className="hidden sm:block h-4 w-px bg-slate-700 mx-1 sm:mx-2" />

                <div className="hidden md:flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-200">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 text-sm font-medium p-1.5 rounded-md transition"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-md transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
