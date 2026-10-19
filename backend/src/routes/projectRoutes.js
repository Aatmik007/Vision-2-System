import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  generateBlueprint,
  updateRoadmapProgress,
  getProjectMarkdown,
  validateProjectConsistency,
  proposeArchitectureRepair,
  applyArchitectureRepair,
  getProjectExport
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/generate-blueprint', generateBlueprint);
router.put('/:id/roadmap-progress', updateRoadmapProgress);
router.get('/:id/markdown', getProjectMarkdown);
router.get('/:id/export', getProjectExport);
router.get('/:id/consistency', validateProjectConsistency);
router.post('/:id/repair-architecture', proposeArchitectureRepair);
router.put('/:id/apply-repair', applyArchitectureRepair);



export default router;
