import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/custom-errors.js";
import type { AnnouncementService } from "../services/announcement-service.js";

function param(req: any, name: string): string {
    const v = req.params[name];
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v[0] ?? "";
    return "";
}

export class AnnouncementController {
    constructor(private service: AnnouncementService) {}

    createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).userId;
            const user = (req as any).user;

            if (!userId) throw new UnauthorizedError("Unauthorized");

            const announcement = await this.service.createAnnouncement(
                userId,
                user.university,
                req.body
            );

            res.status(201).json({
                status: "success",
                data: announcement
            });
        } catch (err) {
            next(err);
        }
    };

    getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;

            const announcements = await this.service.getAnnouncements(
                user.university
            );

            res.status(200).json({
                status: "success",
                data: announcements
            });
        } catch (err) {
            next(err);
        }
    };

    getAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const id = param(req, "id");

            const announcement = await this.service.getAnnouncement(
                user.university,
                id
            );

            res.status(200).json({
                status: "success",
                data: announcement
            });
        } catch (err) {
            next(err);
        }
    };
}