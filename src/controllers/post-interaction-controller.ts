import type { Request, Response, NextFunction } from 'express';
import type { PostInteractionService } from '../services/post-interaction-service.js';
import { UnauthorizedError } from '../utils/custom-errors.js';

function param(req: Request, name: string): string {
    const v = req.params[name];
    return typeof v === 'string' ? v : Array.isArray(v) ? (v[0] ?? '') : '';
}

export class PostInteractionController {
    constructor(private readonly service: PostInteractionService) {}

    like = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.like(
                userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                req.body
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    unlike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.unlike(
                userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                req.body
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    getLikes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createdAt = req.query['createdAt'];
            const data = await this.service.getLikesSummary(
                req.userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                typeof createdAt === 'string'
                    ? createdAt
                    : Array.isArray(createdAt)
                      ? createdAt[0]
                      : createdAt
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.addComment(
                userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                req.body
            );
            res.status(201).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createdAt = req.query['createdAt'];
            const data = await this.service.getComments(
                param(req, 'authorId'),
                param(req, 'postId'),
                typeof createdAt === 'string'
                    ? createdAt
                    : Array.isArray(createdAt)
                      ? createdAt[0]
                      : createdAt
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.updateComment(
                userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                param(req, 'commentId'),
                req.body
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.deleteComment(
                userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                param(req, 'commentId'),
                req.body
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    share = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.share(
                userId,
                param(req, 'authorId'),
                param(req, 'postId'),
                req.body
            );
            res.status(201).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    getShares = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const createdAt = req.query['createdAt'];
            const data = await this.service.getShareStats(
                param(req, 'authorId'),
                param(req, 'postId'),
                typeof createdAt === 'string'
                    ? createdAt
                    : Array.isArray(createdAt)
                      ? createdAt[0]
                      : createdAt
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };
}
