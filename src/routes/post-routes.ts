import { Router } from "express";
import { PostController } from "../controllers/post-controller.js";
import { postService } from "../services/instances.js";
import { requireAuth, optionalAuth } from "../middlewares/require-auth.js";
import { enforceModerationPolicy } from "../middlewares/moderation-policy-middleware.js";

const router = Router();

const controller = new PostController(postService);

router.get("/upload-url", requireAuth, enforceModerationPolicy, controller.getUploadUrl);

router.post("/", requireAuth, enforceModerationPolicy, controller.createPost);

router.get("/social-feed", controller.getSocialFeed);

router.get("/news", controller.getNewsFeed);
router.get("/", controller.getAllPosts);
router.get("/user/:authorId", controller.getPostsByUser);

router.get("/:authorId/:postId", optionalAuth, controller.getPost);

router.delete("/:authorId/:postId", requireAuth, enforceModerationPolicy, controller.deletePost);

export default router;
