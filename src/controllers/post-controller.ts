import type { Request, Response, NextFunction } from "express";
import type { PostService } from "../services/post-service.js";
import { UnauthorizedError } from "../utils/custom-errors.js";

function param(req: any, name: string): string {
    const v = req.params[name];
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v[0] ?? "";
    return "";
}

export class PostController {
    constructor(private readonly service: PostService) {}

    getUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const fileName = req.query.fileName;

            if (typeof fileName !== "string") {
                throw new Error("fileName is required");
            }

            const data = await this.service.getUploadUrl(fileName);

            res.status(200).json({ status: "success", data });
        } catch (err) {
            next(err);
        }
    };

    // 🔥 ACTUALIZADO: soporta type
    createPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).userId;
            if (!userId) throw new UnauthorizedError("Unauthorized");

            const { text, imageUrl, type } = req.body;

            const user = (req as any).user; // para universidad

            const post = await this.service.createPost(
                userId,
                text,
                imageUrl,
                type ?? "normal",
                user?.university
            );

            res.status(201).json({ status: "success", data: post });
        } catch (err) {
            next(err);
        }
    };

    getPost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authorId = Number(param(req, "authorId"));
            const postId = param(req, "postId");

            const post = await this.service.getPost(authorId, postId);

            res.status(200).json({ status: "success", data: post });
        } catch (err) {
            next(err);
        }
    };

    getPostsByUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authorId = Number(param(req, "authorId"));

            const posts = await this.service.getPostsByUser(authorId);

            res.status(200).json({ status: "success", data: posts });
        } catch (err) {
            next(err);
        }
    };

    deletePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).userId;
            if (!userId) throw new UnauthorizedError("Unauthorized");

            const authorId = Number(param(req, "authorId"));
            const postId = param(req, "postId");

            const result = await this.service.deletePost(authorId, postId);

            res.status(200).json({ status: "success", data: result });
        } catch (err) {
            next(err);
        }
    };

    getSocialFeed = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const posts = await this.service.getSocialFeed();
            res.status(200).json({
                status: "success",
                data: posts,
            });
        } catch (e) {
            next(e);
        }
    };

    // 🚀 NUEVO (ARREGLADO)
    getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const posts = await this.service.getAllPosts();
            res.status(200).json({ status: "success", data: posts });
        } catch (err) { next(err); }
    };

    getNewsFeed = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user = (req as any).user;

            const posts = await this.service.getNewsFeed(user?.university);

            res.status(200).json({
                status: "success",
                data: posts
            });
        } catch (e) {
            next(e);
        }
    };
}