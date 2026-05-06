import { Router } from 'express';
import { PostInteractionController } from '../controllers/post-interaction-controller.js';
import { postInteractionService } from '../services/instances.js';
import { optionalAuth, requireAuth } from '../middlewares/require-auth.js';
import { enforceModerationPolicy } from '../middlewares/moderation-policy-middleware.js';

const router = Router();
const controller = new PostInteractionController(postInteractionService);

router.post(
    '/posts/:authorId/:postId/like',
    requireAuth,
    enforceModerationPolicy,
    controller.like
);
router.delete(
    '/posts/:authorId/:postId/like',
    requireAuth,
    enforceModerationPolicy,
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
    enforceModerationPolicy,
    controller.addComment
);
router.get(
    '/posts/:authorId/:postId/comments',
    controller.getComments
);
router.patch(
    '/posts/:authorId/:postId/comments/:commentId',
    requireAuth,
    enforceModerationPolicy,
    controller.updateComment
);
router.delete(
    '/posts/:authorId/:postId/comments/:commentId',
    requireAuth,
    enforceModerationPolicy,
    controller.deleteComment
);

router.post(
    '/posts/:authorId/:postId/share',
    requireAuth,
    enforceModerationPolicy,
    controller.share
);
router.get(
    '/posts/:authorId/:postId/shares',
    controller.getShares
);

router.post(
    '/posts/:authorId/:postId/save',
    requireAuth,
    enforceModerationPolicy,
    controller.save
);
router.delete(
    '/posts/:authorId/:postId/save',
    requireAuth,
    enforceModerationPolicy,
    controller.unsave
);
router.get(
    '/posts/:authorId/:postId/saves',
    optionalAuth,
    controller.getSaves
);

router.post(
    '/posts/:authorId/:postId/repost',
    requireAuth,
    enforceModerationPolicy,
    controller.repost
);
router.get(
    '/posts/:authorId/:postId/reposts',
    controller.getReposts
);

export default router;
