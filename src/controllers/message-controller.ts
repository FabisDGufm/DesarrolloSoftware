import type { Request, Response, NextFunction } from 'express';
import type { MessageService } from '../services/message-service.js';
import { UnauthorizedError } from '../utils/custom-errors.js';

export class MessageController {
    constructor(private readonly service: MessageService) {}

    send = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const data = await this.service.send(userId, req.body);
            res.status(201).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    listConversation = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('Unauthorized'));
                return;
            }
            const other = req.params['otherUserId'];
            const otherUserId =
                typeof other === 'string' ? other : Array.isArray(other) ? (other[0] ?? '') : '';
            const limit = req.query['limit'];
            const data = await this.service.listConversation(
                userId,
                otherUserId,
                typeof limit === 'string'
                    ? limit
                    : Array.isArray(limit)
                      ? limit[0]
                      : limit
            );
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };
}
