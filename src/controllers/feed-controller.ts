// Controlador del feed principal

import type { Request, Response, NextFunction } from 'express';
import type { FeedService } from '../services/feed-service.js';

export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    getFeed = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const feed = await this.feedService.getFeed();
            res.status(200).json({
                status: 'success',
                data: feed
            });
        } catch (error) {
            next(error);
        }
    };
}
