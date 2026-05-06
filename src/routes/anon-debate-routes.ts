import { Router } from 'express';
import { AnonDebateController } from '../controllers/anon-debate-controller.js';
import { AnonDebateService } from '../services/anon-debate-service.js';

const router = Router();
const service = new AnonDebateService();
const controller = new AnonDebateController(service);

router.post('/', controller.create);
router.get('/', controller.listAll);
router.get('/university/:university', controller.listByUniversity);
router.post('/:debateId/replies', controller.createReply);
router.get('/:debateId/replies', controller.getReplies);

export default router;
