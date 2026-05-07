import type {
    Request,
    Response,
    NextFunction
} from "express";

import type { PromotionService } from "../services/promotion-service.js";

import { UnauthorizedError } from "../utils/custom-errors.js";

function param(req: any, name: string): string {

    const v = req.params[name];

    if (typeof v === "string") return v;

    if (Array.isArray(v)) return v[0] ?? "";

    return "";
}

export class PromotionController {

    constructor(
        private readonly service: PromotionService
    ) {}

    getUploadUrl = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const fileName = req.query.fileName;

            if (typeof fileName !== "string") {
                throw new Error("fileName is required");
            }

            const data = await this.service.getUploadUrl(fileName);

            res.status(200).json({
                status: "success",
                data
            });

        } catch (err) {
            next(err);
        }
    };

    createPromotion = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = (req as any).userId;

            if (!userId) {
                throw new UnauthorizedError("Unauthorized");
            }

            const {
                title,
                description,
                price,
                contact,
                imageUrl
            } = req.body;

            const user = (req as any).user;

            const promotion =
                await this.service.createPromotion(
                    userId,
                    title,
                    description,
                    contact,
                    user?.university,
                    price,
                    imageUrl
                );

            res.status(201).json({
                status: "success",
                data: promotion
            });

        } catch (err) {
            next(err);
        }
    };

    getPromotion = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = Number(param(req, "userId"));

            const promotionId = param(req, "promotionId");

            const promotion =
                await this.service.getPromotion(
                    userId,
                    promotionId
                );

            res.status(200).json({
                status: "success",
                data: promotion
            });

        } catch (err) {
            next(err);
        }
    };

    getPromotionsByUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = Number(param(req, "userId"));

            const promotions =
                await this.service.getPromotionsByUser(userId);

            res.status(200).json({
                status: "success",
                data: promotions
            });

        } catch (err) {
            next(err);
        }
    };

    getFeed = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const user = (req as any).user;

            const promotions =
                await this.service.getFeed(
                    user?.university
                );

            res.status(200).json({
                status: "success",
                data: promotions
            });

        } catch (err) {
            next(err);
        }
    };

    deletePromotion = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = Number(param(req, "userId"));

            const promotionId = param(req, "promotionId");

            const result =
                await this.service.deletePromotion(
                    userId,
                    promotionId
                );

            res.status(200).json({
                status: "success",
                data: result
            });

        } catch (err) {
            next(err);
        }
    };
}