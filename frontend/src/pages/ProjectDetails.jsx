import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import ERDiagramVisual from '../components/ERDiagramVisual';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  Clock,
  Layers,
  Cpu,
  Sparkles,
  AlertCircle,
  Code,
  FileText,
  ListChecks,
  Share2,
  Database,
  Network,
  Server,
  Layout,
  FolderTree,
  ShieldCheck,
  Milestone,
  CheckSquare,
  Cloud,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  FileCode,
  Link2,
  CheckCircle,
  Zap,
  Menu,
  X,
  Terminal,
  Lock,
  Box,
  FileJson
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedSection, setCopiedSection] = useState(null);
  const [updatingTask, setUpdatingTask] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState({});

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/${id}`);
      console.log("FRONTEND RECEIVED RESPONSE:", res.data);
      setProject(res.data);
      setError('');
      // Expand all roadmap phases by default
      if (res.data?.generatedBlueprint?.roadmapPhases) {
        const initialExpanded = {};
        res.data.generatedBlueprint.roadmapPhases.forEach((p, idx) => {
          initialExpanded[idx] = true;
        });
        setExpandedPhases(initialExpanded);
      }
    } catch (err) {
      console.error('Fetch project error:', err);
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleGenerateBlueprint = async () => {
    try {
      setGenerating(true);
      setError('');
      const res = await API.post(`/projects/${id}/generate-blueprint`);
      console.log("FRONTEND RECEIVED RESPONSE:", res.data);
      setProject(res.data);
      if (res.data?.generatedBlueprint?.roadmapPhases) {
        const initialExpanded = {};
        res.data.generatedBlueprint.roadmapPhases.forEach((p, idx) => {
          initialExpanded[idx] = true;
        });
        setExpandedPhases(initialExpanded);
      }
    } catch (err) {
      console.error('Generate blueprint error:', err);
      setError(err.response?.data?.message || 'Failed to generate technical blueprint. Please check network connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTask(taskId);
      const res = await API.put(`/projects/${id}/roadmap-progress`, {
        taskId,
        status: newStatus
      });
      setProject(res.data);
    } catch (err) {
      console.error('Update roadmap progress error:', err);
      alert(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    try {
      await API.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project.');
    }
  };

  const handleCopyCode = (codeText, sectionKey) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const togglePhaseExpand = (phaseIdx) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseIdx]: !prev[phaseIdx]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-400 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-lg">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-300">Loading technical blueprint...</span>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-lg space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-semibold">{error}</h2>
          <Link to="/dashboard" className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-750 text-indigo-400 text-xs px-4 py-2 rounded-md font-medium transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const blueprint = project.generatedBlueprint;

  // 13 Production Sidebar Sections
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'requirements', label: 'Requirements', icon: ListChecks },
    { id: 'techstack', label: 'Tech Stack', icon: Cpu },
    { id: 'architecture', label: 'Architecture', icon: Share2 },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'erdiagram', label: 'ER Diagram', icon: Network },
    { id: 'apis', label: 'APIs', icon: Server },
    { id: 'frontend', label: 'Frontend', icon: Layout },
    { id: 'folderstructure', label: 'Folder Structure', icon: FolderTree },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'roadmap', label: 'Roadmap', icon: Milestone },
    { id: 'testing', label: 'Testing', icon: CheckSquare },
    { id: 'deployment', label: 'Deployment', icon: Cloud }
  ];

  const activeItemObj = sidebarItems.find((s) => s.id === activeSection) || sidebarItems[0];

  // Calculate Roadmap Progress Metrics
  let totalTasks = 0;
  let completedTasks = 0;
  if (blueprint?.roadmapPhases) {
    blueprint.roadmapPhases.forEach(phase => {
      if (phase.tasks) {
        totalTasks += phase.tasks.length;
        completedTasks += phase.tasks.filter(t => t.status === 'Completed').length;
      }
    });
  } else if (blueprint?.roadmapSteps) {
    totalTasks = blueprint.roadmapSteps.length;
    completedTasks = blueprint.roadmapSteps.filter(s => s.status === 'Completed').length;
  }
  const roadmapPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-md transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </span>
                <span>•</span>
                <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  {project.projectType}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateBlueprint}
              disabled={generating}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-md transition shadow-sm"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Blueprint...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{blueprint ? 'Regenerate Blueprint' : 'Generate Blueprint'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs font-medium px-3 py-2 rounded-md transition border border-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-4 rounded-md text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!blueprint && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-900">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">No Technical Blueprint Generated Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Click the button below to generate a production-grade 13-section technical specification including dynamic architecture, ER diagram, and 8-phase developer roadmap.
              </p>
            </div>
            <button
              onClick={handleGenerateBlueprint}
              disabled={generating}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-5 py-2.5 rounded-md transition shadow-md"
            >
              <Cpu className="w-4 h-4" />
              <span>Generate Technical Blueprint</span>
            </button>
          </div>
        )}

        {blueprint && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Mobile Dropdown Menu */}
            <div className="lg:hidden bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
                  <activeItemObj.icon className="w-4 h-4" />
                  <span>{activeItemObj.label}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {mobileMenuOpen && (
                <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-1.5">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:block space-y-2 bg-slate-900 border border-slate-800 rounded-lg p-3 h-fit sticky top-20">
              <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase border-b border-slate-800 mb-2">
                Specification Navigation
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* 1. OVERVIEW */}
              {activeSection === 'overview' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <span>Project Overview & Vision</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Executive architectural summary and target user goals</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-md p-4 space-y-3">
                    <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Problem Statement</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {blueprint.problemStatement || blueprint.overview}
                    </p>
                  </div>

                  {blueprint.assumptions && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">System Assumptions & Constraints</h3>
                      <ul className="space-y-2">
                        {blueprint.assumptions.map((ass, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start space-x-2 bg-slate-950 p-2.5 rounded border border-slate-850">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{ass}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {blueprint.userRoles && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">User Roles & Access Control</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {blueprint.userRoles.map((role, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-800 p-3.5 rounded-md space-y-2">
                            <h4 className="text-xs font-bold text-indigo-400">{role.role}</h4>
                            <p className="text-[11px] text-slate-400">{role.description}</p>
                            {role.permissions && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {role.permissions.map((perm, idx) => (
                                  <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                    {perm}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. REQUIREMENTS */}
              {activeSection === 'requirements' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <ListChecks className="w-5 h-5 text-indigo-400" />
                      <span>Requirements Specification</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Functional and non-functional engineering constraints</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Functional Requirements</h3>
                      <div className="space-y-2">
                        {blueprint.functionalRequirements?.map((req, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-md text-xs text-slate-300 flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Non-Functional Requirements</h3>
                      <div className="space-y-2">
                        {blueprint.nonFunctionalRequirements?.map((req, i) => (
                          <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-md text-xs text-slate-300 flex items-start space-x-2">
                            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {blueprint.missingRequirements && blueprint.missingRequirements.length > 0 && (
                    <div className="bg-amber-950/40 border border-amber-900/60 p-4 rounded-md space-y-2">
                      <h3 className="text-xs font-semibold text-amber-300 flex items-center space-x-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Potential Missing Requirements & Edge Cases</span>
                      </h3>
                      <ul className="text-xs text-amber-200/80 space-y-1 pl-5 list-disc">
                        {blueprint.missingRequirements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 3. TECH STACK */}
              {activeSection === 'techstack' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-indigo-400" />
                      <span>Recommended Technology Stack</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Recommended technology stack with technical justification</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blueprint.techStack?.map((item, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 border border-indigo-900 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{item.technology}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{item.purpose}</p>
                        <p className="text-[11px] text-slate-400 italic">"{item.reason}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. ARCHITECTURE */}
              {activeSection === 'architecture' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Share2 className="w-5 h-5 text-indigo-400" />
                      <span>System Architecture & Data Flow</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Interactive 3-tier component topology diagram</p>
                  </div>

                  {blueprint.architecture && (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-md space-y-2">
                      <h3 className="text-xs font-bold text-indigo-300 uppercase">Data Flow Lifecycle</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-2.5 rounded border border-slate-850">
                        {blueprint.architecture.dataFlow}
                      </p>
                    </div>
                  )}

                  <ArchitectureDiagram architecture={blueprint.architecture} />
                </div>
              )}

              {/* 5. DATABASE */}
              {activeSection === 'database' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Database className="w-5 h-5 text-indigo-400" />
                      <span>Database Schema & Entity Definitions</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Detailed field types, primary keys, and foreign key relations</p>
                  </div>

                  <div className="space-y-6">
                    {blueprint.entities?.map((entity, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden space-y-3">
                        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-indigo-400">{entity.name}</span>
                            <span className="text-[11px] text-slate-400">({entity.description})</span>
                          </div>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            PK: {entity.primaryKey}
                          </span>
                        </div>

                        <div className="p-4 space-y-3">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-500 border-b border-slate-850 pb-2">
                                <th className="pb-2 font-medium">Field</th>
                                <th className="pb-2 font-medium">Type</th>
                                <th className="pb-2 font-medium">Required</th>
                                <th className="pb-2 font-medium">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {entity.fields?.map((field, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/50">
                                  <td className="py-2 font-mono text-indigo-300 font-medium">{field.name}</td>
                                  <td className="py-2 text-slate-400 font-mono">{field.type}</td>
                                  <td className="py-2">
                                    {field.required ? (
                                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">Required</span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500">Optional</span>
                                    )}
                                  </td>
                                  <td className="py-2 text-slate-400">{field.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {entity.foreignKeys && entity.foreignKeys.length > 0 && (
                            <div className="pt-2 border-t border-slate-850 flex items-center space-x-2 text-xs">
                              <span className="font-semibold text-slate-400">Foreign Keys:</span>
                              {entity.foreignKeys.map((fk, idx) => (
                                <span key={idx} className="bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded font-mono text-[11px]">
                                  {fk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. ER DIAGRAM */}
              {activeSection === 'erdiagram' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Network className="w-5 h-5 text-indigo-400" />
                      <span>Interactive ER Diagram</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Entity Relationships and Cardinality Matrix (1:1, 1:N, N:M)</p>
                  </div>

                  <ERDiagramVisual entities={blueprint.entities} relationships={blueprint.relationships} />
                </div>
              )}

              {/* 7. APIS */}
              {activeSection === 'apis' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Server className="w-5 h-5 text-indigo-400" />
                      <span>REST API Specifications</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Endpoint definitions with headers, payloads, and response status codes</p>
                  </div>

                  <div className="space-y-4">
                    {blueprint.apiEndpoints?.map((api, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 font-mono">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              api.method === 'GET' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              api.method === 'POST' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' :
                              api.method === 'PUT' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {api.method}
                            </span>
                            <span className="text-sm font-bold text-slate-100">{api.endpoint}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {api.authentication || 'Required (JWT)'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300">{api.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-850">
                          {api.headers && (
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Headers</span>
                              <p className="font-mono text-slate-400 text-[11px] bg-slate-900 p-2 rounded mt-1 border border-slate-850">{api.headers}</p>
                            </div>
                          )}
                          {api.requestBody && api.requestBody !== 'None' && (
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Request Payload</span>
                              <pre className="font-mono text-indigo-300 text-[11px] bg-slate-900 p-2 rounded mt-1 overflow-x-auto border border-slate-850">
                                {api.requestBody}
                              </pre>
                            </div>
                          )}
                        </div>

                        {api.possibleErrors && (
                          <div className="flex items-center space-x-2 text-[11px] pt-1">
                            <span className="text-slate-500 font-semibold">Response Codes:</span>
                            <div className="flex flex-wrap gap-1">
                              {api.possibleErrors.map((err, idx) => (
                                <span key={idx} className="bg-slate-900 text-rose-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                                  {err}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. FRONTEND */}
              {activeSection === 'frontend' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Layout className="w-5 h-5 text-indigo-400" />
                      <span>Frontend Pages & Component Structure</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Page routes, child components, and API integration maps</p>
                  </div>

                  <div className="space-y-4">
                    {blueprint.frontend?.pages?.map((page, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-indigo-300">{page.name}</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {page.route}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{page.purpose}</p>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-850 text-xs">
                          <span className="text-slate-500 font-semibold">Components:</span>
                          {page.components?.map((c, idx) => (
                            <span key={idx} className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. FOLDER STRUCTURE */}
              {activeSection === 'folderstructure' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <FolderTree className="w-5 h-5 text-indigo-400" />
                      <span>Production Directory Architecture</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Clean, scalable file tree layouts for backend and frontend</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-850 pb-2">
                        <span>Frontend Tree</span>
                        <button
                          onClick={() => handleCopyCode(blueprint.folderStructure?.frontend || '', 'folderFrontend')}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                        >
                          {copiedSection === 'folderFrontend' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="text-slate-300 leading-relaxed overflow-x-auto pt-1">
                        {blueprint.folderStructure?.frontend}
                      </pre>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-850 pb-2">
                        <span>Backend Tree</span>
                        <button
                          onClick={() => handleCopyCode(blueprint.folderStructure?.backend || '', 'folderBackend')}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                        >
                          {copiedSection === 'folderBackend' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <pre className="text-slate-300 leading-relaxed overflow-x-auto pt-1">
                        {blueprint.folderStructure?.backend}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. SECURITY */}
              {activeSection === 'security' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <span>Security & Hardening Best Practices</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Authentication safeguards, input sanitization, and header policies</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blueprint.security?.map((sec, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-200">{sec.item}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{sec.recommendation}</p>
                        <p className="text-[11px] text-slate-400 italic">Relevance: {sec.relevance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 11. ROADMAP (8-PHASE GRANULAR PLAN) */}
              {activeSection === 'roadmap' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                        <Milestone className="w-5 h-5 text-indigo-400" />
                        <span>Granular Developer Implementation Roadmap</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">8-Phase step-by-step engineering execution roadmap</p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg flex items-center space-x-4">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Overall Progress</div>
                        <div className="text-xs font-bold text-emerald-400">{completedTasks} / {totalTasks} Tasks ({roadmapPercent}%)</div>
                      </div>
                      <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${roadmapPercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Phase Accordions */}
                  {blueprint.roadmapPhases ? (
                    <div className="space-y-4">
                      {blueprint.roadmapPhases.map((phase, phaseIdx) => {
                        const isExpanded = expandedPhases[phaseIdx] !== false;
                        const phaseTaskCount = phase.tasks ? phase.tasks.length : 0;
                        const phaseCompleted = phase.tasks ? phase.tasks.filter(t => t.status === 'Completed').length : 0;

                        return (
                          <div key={phaseIdx} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden transition">
                            
                            {/* Phase Header */}
                            <div 
                              onClick={() => togglePhaseExpand(phaseIdx)}
                              className="bg-slate-900 hover:bg-slate-850 px-4 py-3.5 flex items-center justify-between cursor-pointer border-b border-slate-800"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold flex items-center justify-center">
                                  {phase.phaseNumber || phaseIdx + 1}
                                </span>
                                <div>
                                  <h3 className="text-xs font-bold text-slate-100">{phase.phaseName}</h3>
                                  <p className="text-[11px] text-slate-400 mt-0.5">{phase.summary}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  {phaseCompleted}/{phaseTaskCount} Done
                                </span>
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>

                            {/* Phase Tasks Checklist */}
                            {isExpanded && (
                              <div className="p-4 space-y-4 divide-y divide-slate-850">
                                {phase.tasks?.map((task, taskIdx) => (
                                  <div key={taskIdx} className="pt-4 first:pt-0 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                      <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-900 px-1.5 py-0.5 rounded">
                                            Task {task.taskId || `${phaseIdx+1}.${taskIdx+1}`}
                                          </span>
                                          <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>
                                      </div>

                                      {/* Status Toggle Button */}
                                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                                        <button
                                          onClick={() => handleStatusChange(task.taskId || task.title, 'Completed')}
                                          disabled={updatingTask === (task.taskId || task.title)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                                            task.status === 'Completed'
                                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                          }`}
                                        >
                                          {task.status === 'Completed' ? '✓ Completed' : 'Mark Done'}
                                        </button>
                                        <button
                                          onClick={() => handleStatusChange(task.taskId || task.title, 'In Progress')}
                                          disabled={updatingTask === (task.taskId || task.title)}
                                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                                            task.status === 'In Progress'
                                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                          }`}
                                        >
                                          In Progress
                                        </button>
                                      </div>
                                    </div>

                                    {/* Action Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-md border border-slate-850">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">What To Build</span>
                                        <p className="text-[11px] text-slate-300 mt-0.5">{task.whatToBuild}</p>
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Expected Outcome</span>
                                        <p className="text-[11px] text-emerald-400 mt-0.5">{task.expectedResult}</p>
                                      </div>

                                      {task.files && task.files.length > 0 && (
                                        <div className="md:col-span-2 pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase">Target Files:</span>
                                          {task.files.map((file, fIdx) => (
                                            <span key={fIdx} className="bg-slate-950 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10px]">
                                              {file}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Fallback Single List */
                    <div className="space-y-4">
                      {blueprint.roadmapSteps?.map((step, i) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400">Step {step.stepNumber}: {step.title}</span>
                            <span className="text-xs font-mono text-slate-400">{step.status}</span>
                          </div>
                          <p className="text-xs text-slate-300">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 12. TESTING */}
              {activeSection === 'testing' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <CheckSquare className="w-5 h-5 text-indigo-400" />
                      <span>Automated Testing Strategy</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Unit, integration, and UI testing suites</p>
                  </div>

                  <div className="space-y-4">
                    {blueprint.testing?.map((test, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300">{test.type}</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Tool: {test.tool}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{test.strategy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 13. DEPLOYMENT */}
              {activeSection === 'deployment' && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                      <Cloud className="w-5 h-5 text-indigo-400" />
                      <span>Production Deployment & Containerization</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Docker multi-stage setup, Nginx proxy, and environment configs</p>
                  </div>

                  {blueprint.deployment && (
                    <div className="space-y-6">
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase">Deployment Target</h3>
                        <p className="text-xs text-slate-300">{blueprint.deployment.platform}</p>

                        {blueprint.deployment.envVars && (
                          <div className="pt-2 border-t border-slate-850">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Required Environment Variables</span>
                            <div className="flex flex-wrap gap-1.5">
                              {blueprint.deployment.envVars.map((env, idx) => (
                                <span key={idx} className="bg-slate-900 text-amber-300 border border-slate-800 font-mono text-[11px] px-2 py-0.5 rounded">
                                  {env}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Code Snippets */}
                      {blueprint.deployment.dockerfileSnippet && (
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-400 border-b border-slate-850 pb-2">
                            <span>Backend Dockerfile</span>
                            <button
                              onClick={() => handleCopyCode(blueprint.deployment.dockerfileSnippet, 'dockerfile')}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                            >
                              {copiedSection === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed pt-1">
                            {blueprint.deployment.dockerfileSnippet}
                          </pre>
                        </div>
                      )}

                      {blueprint.deployment.nginxSnippet && (
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-400 border-b border-slate-850 pb-2">
                            <span>Nginx Reverse Proxy Config</span>
                            <button
                              onClick={() => handleCopyCode(blueprint.deployment.nginxSnippet, 'nginx')}
                              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                            >
                              {copiedSection === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <pre className="font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed pt-1">
                            {blueprint.deployment.nginxSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
