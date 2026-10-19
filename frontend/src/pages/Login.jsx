import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLocalError('');
    try {
      setSubmitting(true);
      await googleLogin({ credential: credentialResponse.credential });
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Google login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setLocalError('Google Sign In was cancelled or failed.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-lg">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-950 text-indigo-400 rounded-lg flex items-center justify-center mx-auto mb-3 border border-indigo-900">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to manage your Vision2System projects</p>
        </div>

        {localError && (
          <div className="mb-6 bg-rose-950/60 border border-rose-800/80 text-rose-300 p-3 rounded-md text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{localError}</span>
          </div>
        )}

        {/* Google OAuth Section */}
        <div className="mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            shape="pill"
            text="continue_with"
          />
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-wider">or email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition shadow-sm"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-medium hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
