import express from 'express';
import { getComments, createComment } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getComments);
router.post('/', authenticate, createComment);

export default router;
