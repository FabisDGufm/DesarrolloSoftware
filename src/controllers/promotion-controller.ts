import type { Request, Response, NextFunction } from "express";
import type { PromotionService } from "../services/promotion-service.js";
import type { User } from "../models/user.js";
import { UnauthorizedError } from "../utils/custom-errors.js";

// 🔥 Tipado local para evitar express.d.ts
interface AuthRequest extends Request {
    userId?: number;
    user?: User;
}

export class PromotionController {
    constructor(private service: PromotionService) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;
            const user = req.user;

            if (!userId || !user) {
                throw new UnauthorizedError("Unauthorized");
            }

            
            if (!user.university) {
                throw new Error("User university is required");
            }

            const university = user.university;

            const { title, description, contact, price, imageUrl } = req.body;

            const promotion = await this.service.createPromotion(
                userId,
                university,
                title,
                description,
                contact,
                price,
                imageUrl
            );

            return res.status(201).json({
                status: "success",
                data: promotion
            });

        } catch (err) {
            next(err);
        }
    };

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const promotions = await this.service.getAllPromotions();

            return res.status(200).json({
                status: "success",
                data: promotions
            });

        } catch (err) {
            next(err);
        }
    };

    getMyUniversity = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new UnauthorizedError("Unauthorized");
            }

            // ✅ FIX aquí también
            if (!user.university) {
                throw new Error("User university is required");
            }

            const promotions = await this.service.getByUniversity(user.university);

            return res.status(200).json({
                status: "success",
                data: promotions
            });

        } catch (err) {
            next(err);
        }
    };

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            // ✅ FIX string | string[] | undefined
            if (!id || Array.isArray(id)) {
                throw new Error("Invalid id");
            }

            const result = await this.service.deletePromotion(id);

            return res.status(200).json({
                status: "success",
                data: result
            });

        } catch (err) {
            next(err);
        }
    };
}