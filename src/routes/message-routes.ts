import { Router } from 'express';
import { MessageController } from '../controllers/message-controller.js';
import { messageService } from '../services/instances.js';
import { requireAuth } from '../middlewares/require-auth.js';

const router = Router();
const controller = new MessageController(messageService);

router.post('/', requireAuth, controller.send);
router.get('/with/:otherUserId', requireAuth, controller.listConversation);

export default router;
