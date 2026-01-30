import express from 'express';
import { getDashboard } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getDashboard);

export default router;
