import express from 'express';
import {
  getEvaluationReport,
  runEvaluation
} from '../controllers/evaluationController.js';

const router = express.Router();

router.get('/results', getEvaluationReport);
router.post('/run', runEvaluation);

export default router;
