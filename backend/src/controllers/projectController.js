import Project from '../models/Project.js';
import { analyzeRequirements, generateArchitectureMarkdown } from '../services/aiService.js';
import { validateArchitectureConsistency, summarizeFindings } from '../services/consistencyValidator.js';
import { repairArchitectureBlueprint } from '../services/architectureRepairService.js';
import { validateArchitectureBlueprint } from '../validators/architectureSchema.js';
import { generateArchitectureExportBundle, generateExportFilename } from '../services/exportService.js';

/**
 * @desc    Get all projects owned by authenticated user
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error.message);
    return res.status(500).json({ message: 'Failed to retrieve projects.' });
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const { name, description, projectType, preferredStack } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Project requirement description is required.' });
    }

    const project = await Project.create({
      user: req.user._id,
      name: name.trim(),
      description: description.trim(),
      projectType: projectType || 'Web Application',
      preferredStack: preferredStack || 'Auto Detect'
    });

    // Automatically generate technical blueprint upon creation
    try {
      const blueprintData = await analyzeRequirements(project);
      if (blueprintData) {
        project.generatedBlueprint = blueprintData;
        await project.save();
      }
    } catch (aiErr) {
      console.error('Auto blueprint generation error during project creation:', aiErr.message);
    }

    return res.status(201).json(project);
  } catch (error) {
    console.error('Create Project Error:', error.message);
    return res.status(500).json({ message: 'Failed to create project.' });
  }
};

/**
 * @desc    Get single project details by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project.' });
    }

    return res.json(project);
  } catch (error) {
    console.error('Get Project Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    return res.status(500).json({ message: 'Failed to retrieve project.' });
  }
};

/**
 * @desc    Update project details / Rename project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this project.' });
    }

    const { name, description, projectType, preferredStack } = req.body;

    if (name && name.trim()) project.name = name.trim();
    if (description && description.trim()) project.description = description.trim();
    if (projectType) project.projectType = projectType;
    if (preferredStack) project.preferredStack = preferredStack;

    const updatedProject = await project.save();
    return res.json(updatedProject);
  } catch (error) {
    console.error('Update Project Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    return res.status(500).json({ message: 'Failed to update project.' });
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project.' });
    }

    await project.deleteOne();
    return res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete Project Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid project ID format.' });
    }
    return res.status(500).json({ message: 'Failed to delete project.' });
  }
};

/**
 * @desc    Generate structured AI blueprint from requirement
 * @route   POST /api/projects/:id/generate-blueprint
 * @access  Private
 */
export const generateBlueprint = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project.' });
    }

    const blueprintData = await analyzeRequirements(project);

    if (!blueprintData) {
      return res.status(500).json({ message: 'Failed to generate blueprint from requirements.' });
    }

    project.generatedBlueprint = blueprintData;
    const updatedProject = await project.save();

    return res.json(updatedProject);
  } catch (error) {
    console.error('Generate Blueprint Error:', error.message);
    return res.status(500).json({ message: 'Failed to generate blueprint.' });
  }
};

/**
 * @desc    Update progress status for a roadmap step / task
 * @route   PUT /api/projects/:id/roadmap-progress
 * @access  Private
 */
export const updateRoadmapProgress = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this project.' });
    }

    const { taskId, stepNumber, status } = req.body;
    const searchId = String(taskId || stepNumber);

    if (!project.generatedBlueprint) {
      return res.status(400).json({ message: 'No blueprint exists for this project.' });
    }

    let updated = false;

    // Check multi-phase roadmapPhases structure
    if (project.generatedBlueprint.roadmapPhases && Array.isArray(project.generatedBlueprint.roadmapPhases)) {
      for (const phase of project.generatedBlueprint.roadmapPhases) {
        if (phase.tasks && Array.isArray(phase.tasks)) {
          const targetTask = phase.tasks.find((t) => String(t.taskId) === searchId || String(t.title) === searchId);
          if (targetTask) {
            targetTask.status = status;
            updated = true;
            break;
          }
        }
      }
    }

    // Legacy roadmapSteps fallback array
    if (!updated && project.generatedBlueprint.roadmapSteps && Array.isArray(project.generatedBlueprint.roadmapSteps)) {
      const steps = project.generatedBlueprint.roadmapSteps;
      const targetStep = steps.find((s) => String(s.stepNumber) === searchId || String(s.taskId) === searchId);
      if (targetStep) {
        targetStep.status = status;
        updated = true;
      }
    }

    if (updated) {
      project.markModified('generatedBlueprint');
      const updatedProject = await project.save();
      return res.json(updatedProject);
    } else {
      return res.status(404).json({ message: 'Roadmap task not found.' });
    }
  } catch (error) {
    console.error('Update Roadmap Progress Error:', error.message);
    return res.status(500).json({ message: 'Failed to update roadmap progress.' });
  }
};

/**
 * @desc    Get architecture specification as Markdown
 * @route   GET /api/projects/:id/markdown
 * @access  Private
 */
export const getProjectMarkdown = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project.' });
    }

    if (!project.generatedBlueprint) {
      return res.status(400).json({ message: 'No blueprint exists for this project.' });
    }

    const findings = validateArchitectureConsistency(project.generatedBlueprint);
    const summary = summarizeFindings(findings);
    const markdown = generateArchitectureMarkdown(project.generatedBlueprint, project.name, { project, findings, summary });
    return res.json({ markdown });
  } catch (error) {
    console.error('Get Project Markdown Error:', error.message);
    return res.status(500).json({ message: 'Failed to generate markdown specification.' });
  }
};

/**
 * @desc    Export full validated architecture package as JSON or Markdown
 * @route   GET /api/projects/:id/export
 * @access  Private
 */
export const getProjectExport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project.' });
    }

    if (!project.generatedBlueprint) {
      return res.status(400).json({ message: 'No blueprint exists for this project.' });
    }

    const findings = validateArchitectureConsistency(project.generatedBlueprint);
    const summary = summarizeFindings(findings);

    const format = (req.query.format || 'json').toLowerCase();
    const download = req.query.download === 'true';

    if (format === 'markdown' || format === 'md') {
      const markdown = generateArchitectureMarkdown(project.generatedBlueprint, project.name, { project, findings, summary });
      const filename = generateExportFilename(project.name, 'md');

      if (download) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(markdown);
      }
      return res.json({ markdown, filename });
    }

    // Default to JSON export bundle
    const exportBundle = generateArchitectureExportBundle(project, findings, summary);
    const filename = generateExportFilename(project.name, 'json');

    if (download) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(JSON.stringify(exportBundle, null, 2));
    }

    return res.json({ exportBundle, filename });
  } catch (error) {
    console.error('Get Project Export Error:', error.message);
    return res.status(500).json({ message: 'Failed to generate architecture export.' });
  }
};


/**
 * @desc    Validate architecture consistency and detect discrepancies
 * @route   GET /api/projects/:id/consistency
 * @access  Private
 */
export const validateProjectConsistency = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this project.' });
    }

    if (!project.generatedBlueprint) {
      return res.status(400).json({ message: 'No blueprint exists for this project.' });
    }

    const findings = validateArchitectureConsistency(project.generatedBlueprint);
    const summary = summarizeFindings(findings);

    return res.json({ findings, summary });
  } catch (error) {
    console.error('Validate Consistency Error:', error.message);
    return res.status(500).json({ message: 'Failed to validate architecture consistency.' });
  }
};

/**
 * @desc    Generate AI-assisted architecture repair proposal on a copy without saving
 * @route   POST /api/projects/:id/repair-architecture
 * @access  Private
 */
export const proposeArchitectureRepair = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this project.' });
    }

    if (!project.generatedBlueprint) {
      return res.status(400).json({ message: 'No blueprint exists for this project.' });
    }

    const { selectedFindingIds } = req.body;

    const repairResult = repairArchitectureBlueprint(
      project.generatedBlueprint,
      selectedFindingIds,
      project
    );

    return res.json({
      original: project.generatedBlueprint,
      proposed: repairResult.proposed,
      initialFindingsCount: repairResult.initialFindingsCount,
      resolvedFindingsCount: repairResult.resolvedFindingsCount,
      resolvedFindingIds: repairResult.resolvedFindingIds,
      remainingFindings: repairResult.remainingFindings,
      summary: summarizeFindings(repairResult.remainingFindings)
    });
  } catch (error) {
    console.error('Propose Architecture Repair Error:', error.message);
    return res.status(500).json({ message: 'Failed to generate architecture repair proposal.' });
  }
};

/**
 * @desc    Confirm and apply repaired architecture to project
 * @route   PUT /api/projects/:id/apply-repair
 * @access  Private
 */
export const applyArchitectureRepair = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this project.' });
    }

    const { proposedBlueprint } = req.body;

    if (!proposedBlueprint || typeof proposedBlueprint !== 'object') {
      return res.status(400).json({ message: 'Valid proposed blueprint is required to apply repair.' });
    }

    const validation = validateArchitectureBlueprint(proposedBlueprint);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Proposed blueprint failed schema validation.',
        errors: validation.errors
      });
    }

    project.generatedBlueprint = validation.data;
    project.markModified('generatedBlueprint');
    const updatedProject = await project.save();

    return res.json(updatedProject);
  } catch (error) {
    console.error('Apply Architecture Repair Error:', error.message);
    return res.status(500).json({ message: 'Failed to apply repaired architecture.' });
  }
};


