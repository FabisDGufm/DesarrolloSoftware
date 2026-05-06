import { Router } from "express";
import { PostController } from "../controllers/post-controller.js";
import { postService } from "../services/instances.js";
import { requireAuth, optionalAuth } from "../middlewares/require-auth.js";
import { enforceModerationPolicy } from "../middlewares/moderation-policy-middleware.js";

const router = Router();

const controller = new PostController(postService);

// =========================
// S3 upload URL
// =========================
router.get("/upload-url", requireAuth, enforceModerationPolicy, controller.getUploadUrl);

// =========================
// POSTS
// =========================
router.post("/", requireAuth, enforceModerationPolicy, controller.createPost);

router.get("/:authorId/:postId", optionalAuth, controller.getPost);

router.get("/user/:authorId", controller.getPostsByUser);

router.delete("/:authorId/:postId", requireAuth, enforceModerationPolicy, controller.deletePost);

export default router;