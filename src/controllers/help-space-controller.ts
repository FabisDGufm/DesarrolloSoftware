import type { Request, Response, NextFunction } from 'express';
import type { HelpSpaceService } from '../services/help-space-service.js';
import { UnauthorizedError } from '../utils/custom-errors.js';

export class HelpSpaceController {
    constructor(private readonly service: HelpSpaceService) {}

    listSpaces = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = this.service.listSpaces();
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    listMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const slugParam = req.params['slug'];
            const slug =
                typeof slugParam === 'string'
                    ? slugParam
                    : Array.isArray(slugParam)
                      ? (slugParam[0] ?? '')
                      : '';
            const limit = req.query['limit'];
            const data = await this.service.listMessages(slug, limit);
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    postMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const slugParam = req.params['slug'];
            const slug =
                typeof slugParam === 'string'
                    ? slugParam
                    : Array.isArray(slugParam)
                      ? (slugParam[0] ?? '')
                      : '';
            const data = await this.service.postMessage(slug, userId, req.body);
            res.status(201).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };
}
