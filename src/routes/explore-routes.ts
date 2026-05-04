// Rutas de Explore (búsqueda)

import { Router } from 'express';
import { ExploreController } from '../controllers/explore-controller.js';
import { exploreService } from '../services/instances.js';

const router = Router();
const controller = new ExploreController(exploreService);

router.get('/meta', controller.meta);
router.get('/browse/:type', controller.browseByType);
// GET /explore?q=... (q vacío = destacados) | GET /explore/search?q=...
router.get('/search', controller.search);
router.get('/', controller.search);

export default router;
