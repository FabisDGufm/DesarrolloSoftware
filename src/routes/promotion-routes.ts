import { Router } from "express";

import { PromotionController } from "../controllers/promotion-controller.js";

import { promotionService } from "../services/instances.js";

import {
    requireAuth,
    optionalAuth
} from "../middlewares/require-auth.js";

import {
    enforceModerationPolicy
} from "../middlewares/moderation-policy-middleware.js";

const router = Router();

const controller =
    new PromotionController(promotionService);

router.get(
    "/upload-url",
    requireAuth,
    enforceModerationPolicy,
    controller.getUploadUrl
);

router.post(
    "/",
    requireAuth,
    enforceModerationPolicy,
    controller.createPromotion
);

router.get(
    "/feed",
    optionalAuth,
    controller.getFeed
);

router.get(
    "/user/:userId",
    controller.getPromotionsByUser
);

router.get(
    "/:userId/:promotionId",
    optionalAuth,
    controller.getPromotion
);

router.delete(
    "/:userId/:promotionId",
    requireAuth,
    enforceModerationPolicy,
    controller.deletePromotion
);

export default router;