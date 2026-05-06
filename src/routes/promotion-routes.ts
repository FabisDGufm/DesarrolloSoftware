import { Router } from "express";
import { PromotionController } from "../controllers/promotion-controller.js";
import { PromotionService } from "../services/promotion-service.js";
import { PromotionRepository } from "../repositories/promotion-repository.js";
import { requireAuth } from "../middlewares/require-auth.js";

const router = Router();

const repo = new PromotionRepository();
const service = new PromotionService(repo);
const controller = new PromotionController(service);

router.post("/", requireAuth, controller.create);
router.get("/", controller.getAll);
router.get("/my-university", requireAuth, controller.getMyUniversity);
router.delete("/:id", requireAuth, controller.delete);

export default router;