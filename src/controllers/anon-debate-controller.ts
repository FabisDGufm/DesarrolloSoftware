import type { Request, Response, NextFunction } from 'express';
import type { AnonDebateService } from '../services/anon-debate-service.js';
import { DebateReplyRepository } from '../repositories/debate-reply-repository.js';

const replyRepo = new DebateReplyRepository();

export class AnonDebateController {
    constructor(private readonly service: AnonDebateService) {}

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { text, university } = req.body;
            const debate = await this.service.create(text, university);
            res.status(201).json({ status: 'success', data: debate });
        } catch (error) {
            next(error);
        }
    };

    listAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const debates = await this.service.listAll();
            res.status(200).json({ status: 'success', data: debates });
        } catch (error) {
            next(error);
        }
    };

    listByUniversity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const university = req.params.university as string;
            const debates = await this.service.listByUniversity(university);
            res.status(200).json({ status: 'success', data: debates });
        } catch (error) {
            next(error);
        }
    };

    createReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const debateId = req.params.debateId as string;
            const { text, university } = req.body;
            if (!text || !text.trim()) {
                res.status(400).json({ status: 'error', message: 'Text is required' });
                return;
            }
            const reply = await replyRepo.create({
                debateId,
                text: text.trim(),
                university: university || 'General',
            });
            res.status(201).json({ status: 'success', data: reply });
        } catch (error) {
            next(error);
        }
    };

    getReplies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const debateId = req.params.debateId as string;
            const replies = await replyRepo.listByDebate(debateId);
            res.status(200).json({ status: 'success', data: replies });
        } catch (error) {
            next(error);
        }
    };
}
