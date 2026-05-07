// routes/announcement-routes.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";
import { AnnouncementController } from "../controllers/announcement-controller.js";
import { AnnouncementService } from "../services/announcement-service.js";
import { AnnouncementRepository } from "../repositories/announcement-repository.js";

const router = Router();

const repo = new AnnouncementRepository();
const service = new AnnouncementService(repo);
const controller = new AnnouncementController(service);

// crear anuncio
router.post("/", requireAuth, controller.create);

// obtener anuncios
router.get("/", requireAuth, controller.getAll);

export default router;