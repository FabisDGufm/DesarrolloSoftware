import type { Request, Response, NextFunction } from "express";
import { NewsService } from "../services/news-service.js";

const service = new NewsService();

export class NewsController {
    getGuatemalaNews = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const news = await service.getGuatemalaNews();

            res.status(200).json({
                status: "success",
                data: news
            });
        } catch (err) {
            next(err);
        }
    };
}