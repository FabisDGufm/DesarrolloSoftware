import { Router } from "express";
import { NewsController } from "../controllers/news-controller.js";

const router = Router();
const controller = new NewsController();

// Noticias externas Guatemala
router.get("/guatemala", controller.getGuatemalaNews);

export default router;