import express from 'express';
import { getUserProfile, getAnalytics, updateExternalProfile, removeExternalProfile, getDashboard } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { getSolvedSubmissions } from '../controllers/user.controller.js';
const router = express.Router();

router.get('/profile', authenticate, getUserProfile);
router.get('/analytics', authenticate, getAnalytics);
router.get('/dashboard', authenticate, getDashboard);
router.post('/external-profiles', authenticate, updateExternalProfile);
router.put('/external-profiles', authenticate, updateExternalProfile);
router.delete('/external-profiles', authenticate, removeExternalProfile);
router.get("/solved", authenticate, getSolvedSubmissions);

export default router;
