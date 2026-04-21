// Rutas de Explore (búsqueda)

import { Router } from 'express';
import { ExploreController } from '../controllers/explore-controller.js';
import { exploreService } from '../services/instances.js';

const router = Router();
const controller = new ExploreController(exploreService);

// GET /explore?q=... o GET /explore/search?q=...
router.get('/', controller.search);
router.get('/search', controller.search);

export default router;
