// Rutas del feed principal

import { Router } from 'express';
import { FeedController } from '../controllers/feed-controller.js';
import { feedService } from '../services/instances.js';

const router = Router();
const controller = new FeedController(feedService);

// GET feed principal (simulado)
router.get('/', controller.getFeed);

export default router;
