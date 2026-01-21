import express from 'express';
import { getUserProfile, getAnalytics, updateExternalProfile, removeExternalProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', authenticate, getUserProfile);
router.get('/analytics', authenticate, getAnalytics);
router.post('/external-profiles', authenticate, updateExternalProfile);
router.put('/external-profiles', authenticate, updateExternalProfile);
router.delete('/external-profiles', authenticate, removeExternalProfile);

export default router;
