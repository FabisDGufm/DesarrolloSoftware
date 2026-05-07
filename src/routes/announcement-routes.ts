import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";
import { AnnouncementController } from "../controllers/announcement-controller.js";
import { announcementService } from "../services/instances.js";

const router = Router();

const controller = new AnnouncementController(announcementService);

router.post("/", requireAuth, controller.createAnnouncement);
router.get("/", requireAuth, controller.getAnnouncements);
router.get("/:id", requireAuth, controller.getAnnouncement);

export default router;