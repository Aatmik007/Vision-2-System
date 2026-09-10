import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Edit2, Trash2, Calendar, Clock, Layers, Check, X } from 'lucide-react';

const ProjectCard = ({ project, onDelete, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const formattedCreated = new Date(project.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedUpdated = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleSaveRename = async () => {
    if (!newName.trim()) return;
    await onRename(project._id, newName.trim());
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setNewName(project.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        {/* Card Header & Title / Inline Edit */}
        <div className="flex items-start justify-between">
          {isEditing ? (
            <div className="flex items-center space-x-2 w-full pr-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveRename}
                className="p-1 text-emerald-400 hover:text-emerald-300"
                title="Save Name"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelRename}
                className="p-1 text-slate-400 hover:text-slate-300"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h3 className="text-base font-semibold text-slate-100 truncate pr-2" title={project.name}>
              {project.name}
            </h3>
          )}

          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-indigo-300 border border-slate-700 whitespace-nowrap">
            <Layers className="w-3 h-3 mr-1 text-indigo-400" />
            {project.projectType || 'Web Application'}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs mt-2.5 line-clamp-3 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col space-y-3">
        
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Created: {formattedCreated}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Updated: {formattedUpdated}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition"
              title="Rename Project"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Rename</span>
            </button>

            <button
              onClick={() => onDelete(project._id)}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded hover:bg-slate-800 transition"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <Link
            to={`/projects/${project._id}`}
            className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-900 transition"
          >
            <span>Open</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ProjectCard;
