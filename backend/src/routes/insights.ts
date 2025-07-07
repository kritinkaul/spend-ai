import express from 'express';
import { generateInsights, getInsights } from '../controllers/insightsController';

const router = express.Router();

router.post('/generate', generateInsights);
router.get('/:userId', getInsights);

export default router; 