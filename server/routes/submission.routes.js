import express from 'express';
import { submitSolution, getUserSubmissions, runCode } from '../controllers/submission.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/run', runCode);
router.post('/', authenticate, submitSolution);
router.get('/', authenticate, getUserSubmissions);

export default router;
