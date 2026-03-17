// Controlador de Explore (búsqueda)

import type { Request, Response, NextFunction } from 'express';
import type { ExploreService } from '../services/explore-service.js';

export class ExploreController {
    constructor(private readonly exploreService: ExploreService) {}

    search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = (req.query.q as string) ?? '';
            const results = await this.exploreService.search(q);
            res.status(200).json({
                status: 'success',
                data: results
            });
        } catch (error) {
            next(error);
        }
    };
}
