import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Web Application');
  const [preferredStack, setPreferredStack] = useState('Auto Detect');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a project name.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter your project requirements.');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/projects', {
        name: name.trim(),
        description: description.trim(),
        projectType,
        preferredStack
      });

      // Navigate to Project Details page
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-md transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Create New Project</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your application idea and requirements to initialize your project
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-md text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Project Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Food Delivery Platform"
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Project Description / Requirement <span className="text-indigo-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="I want to build a food delivery website where users can order food, restaurants can manage orders, and delivery partners can track deliveries..."
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-2.5 px-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Describe user roles, core features, and goals in plain language.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Web Application">Web Application</option>
                <option value="SaaS">SaaS</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Mobile Application">Mobile Application</option>
                <option value="Portfolio">Portfolio</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Technology
              </label>
              <select
                value={preferredStack}
                onChange={(e) => setPreferredStack(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-2 px-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Auto Detect">Auto Detect</option>
                <option value="MERN">MERN Stack (MongoDB, Express, React, Node)</option>
                <option value="Java + Spring Boot">Java + Spring Boot</option>
                <option value="Python">Python (Django / FastAPI)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Saving Project...' : 'Generate Blueprint'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateProject;
