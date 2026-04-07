import { Router } from 'express';
import { PostInteractionController } from '../controllers/post-interaction-controller.js';
import { postInteractionService } from '../services/instances.js';
import { optionalAuth, requireAuth } from '../middlewares/require-auth.js';

const router = Router();
const controller = new PostInteractionController(postInteractionService);

router.post(
    '/posts/:authorId/:postId/like',
    requireAuth,
    controller.like
);
router.delete(
    '/posts/:authorId/:postId/like',
    requireAuth,
    controller.unlike
);
router.get(
    '/posts/:authorId/:postId/likes',
    optionalAuth,
    controller.getLikes
);

router.post(
    '/posts/:authorId/:postId/comments',
    requireAuth,
    controller.addComment
);
router.get(
    '/posts/:authorId/:postId/comments',
    controller.getComments
);
router.patch(
    '/posts/:authorId/:postId/comments/:commentId',
    requireAuth,
    controller.updateComment
);
router.delete(
    '/posts/:authorId/:postId/comments/:commentId',
    requireAuth,
    controller.deleteComment
);

router.post(
    '/posts/:authorId/:postId/share',
    requireAuth,
    controller.share
);
router.get(
    '/posts/:authorId/:postId/shares',
    controller.getShares
);

export default router;
