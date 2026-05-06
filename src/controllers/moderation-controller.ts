import type { Request, Response, NextFunction } from 'express';
import type { ModerationService } from '../services/moderation-service.js';
import { UnauthorizedError } from '../utils/custom-errors.js';

export class ModerationController {
    constructor(private readonly service: ModerationService) {}

    createReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('No token provided'));
                return;
            }
            const data = await this.service.createReport(userId, req.body);
            res.status(201).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    listReports = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.listOpenReports();
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    resolveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('No token provided'));
                return;
            }
            const reportId = req.params['reportId'];
            const id = typeof reportId === 'string' ? reportId : Array.isArray(reportId) ? reportId[0] : '';
            if (!id) {
                res.status(400).json({ status: 'error', message: 'reportId requerido' });
                return;
            }
            const data = await this.service.resolveReport(userId, id, req.body);
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('No token provided'));
                return;
            }
            const targetUserId = Number(req.params['userId']);
            if (!Number.isFinite(targetUserId)) {
                res.status(400).json({ status: 'error', message: 'userId invalido' });
                return;
            }
            const data = await this.service.suspendUser(userId, targetUserId, req.body);
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    banUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('No token provided'));
                return;
            }
            const targetUserId = Number(req.params['userId']);
            if (!Number.isFinite(targetUserId)) {
                res.status(400).json({ status: 'error', message: 'userId invalido' });
                return;
            }
            const data = await this.service.banUser(userId, targetUserId);
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };

    reinstateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userId;
            if (userId === undefined) {
                next(new UnauthorizedError('No token provided'));
                return;
            }
            const targetUserId = Number(req.params['userId']);
            if (!Number.isFinite(targetUserId)) {
                res.status(400).json({ status: 'error', message: 'userId invalido' });
                return;
            }
            const data = await this.service.reinstateUser(userId, targetUserId);
            res.status(200).json({ status: 'success', data });
        } catch (e) {
            next(e);
        }
    };
}
