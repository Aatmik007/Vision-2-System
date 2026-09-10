import { Project } from '../models/Project.js';
import { GeneratedArchitecture } from '../models/GeneratedArchitecture.js';
import { GeneratedDatabase } from '../models/GeneratedDatabase.js';
import { GeneratedAPI } from '../models/GeneratedAPI.js';
import { GeneratedRoadmap } from '../models/GeneratedRoadmap.js';

export const getProjectArchitecture = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const arch = project.latestBlueprint?.architecture || { nodes: [], edges: [] };
    return res.status(200).json({ success: true, architecture: arch, review: project.latestBlueprint?.review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve architecture', error: error.message });
  }
};

export const getProjectDatabase = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const db = project.latestBlueprint?.database || { tables: [], relationships: [] };
    return res.status(200).json({ success: true, database: db });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve database schema', error: error.message });
  }
};

export const getProjectAPIs = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const apis = project.latestBlueprint?.apis || [];
    return res.status(200).json({ success: true, apis });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve APIs', error: error.message });
  }
};

export const getProjectSecurity = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const sec = project.latestBlueprint?.security || {};
    return res.status(200).json({ success: true, security: sec });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve security analysis', error: error.message });
  }
};

export const getProjectRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const roadmap = project.latestBlueprint?.roadmap || [];
    return res.status(200).json({ success: true, roadmap });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve roadmap', error: error.message });
  }
};
