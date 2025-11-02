import express from 'express';
import { getUser } from '../controllers/userController.js';
import { verifyAny } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', verifyAny, getUser);

export default router;

