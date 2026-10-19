import {
  runEvaluationSuite,
  getLatestEvaluationResults
} from '../evaluation/evaluationRunner.js';

/**
 * @desc    Get latest AI quality evaluation results and metrics
 * @route   GET /api/evaluation/results
 * @access  Public / Authenticated
 */
export const getEvaluationReport = async (req, res) => {
  try {
    const report = await getLatestEvaluationResults();
    return res.json(report);
  } catch (error) {
    console.error('[EvaluationController] Get Evaluation Report Error:', error.message);
    return res.status(500).json({ message: 'Failed to retrieve evaluation results.' });
  }
};

/**
 * @desc    Trigger a fresh run of the AI evaluation suite
 * @route   POST /api/evaluation/run
 * @access  Public / Authenticated
 */
export const runEvaluation = async (req, res) => {
  try {
    const { useLiveApi, filterDomains } = req.body || {};
    const report = await runEvaluationSuite({ useLiveApi, filterDomains });
    return res.json(report);
  } catch (error) {
    console.error('[EvaluationController] Run Evaluation Error:', error.message);
    return res.status(500).json({ message: 'Failed to execute evaluation suite.' });
  }
};
