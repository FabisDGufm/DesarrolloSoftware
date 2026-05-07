import type { Request, Response, NextFunction } from "express";
import type { AnnouncementService } from "../services/announcement-service.js";
import { UnauthorizedError } from "../utils/custom-errors.js";

export class AnnouncementController {
    constructor(private readonly service: AnnouncementService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).userId;
            if (!userId) throw new UnauthorizedError("Unauthorized");

            const { text, imageUrl } = req.body;
            const user = (req as any).user;

            const data = await this.service.createAnnouncement(
                userId,
                text,
                imageUrl,
                user?.university
            );

            res.status(201).json({ status: "success", data });
        } catch (e) {
            next(e);
        }
    };

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (_req as any).user;

            const data = await this.service.getAnnouncements(
                user?.university
            );

            res.status(200).json({ status: "success", data });
        } catch (e) {
            next(e);
        }
    };
}