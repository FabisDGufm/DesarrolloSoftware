// Controlador de Explore (listado + búsqueda)

import type { Request, Response, NextFunction } from 'express';
import type { ExploreService } from '../services/explore-service.js';

function param(req: Request, name: string): string {
    const v = req.params[name];
    return typeof v === 'string' ? v : Array.isArray(v) ? (v[0] ?? '') : '';
}

function queryString(raw: unknown): string {
    if (raw === undefined || raw === null) return '';
    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw)) {
        const first = raw[0];
        return typeof first === 'string' ? first : '';
    }
    return '';
}

export class ExploreController {
    constructor(private readonly exploreService: ExploreService) {}

    search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const q = queryString(req.query['q']);
            const results = await this.exploreService.search(q);
            res.status(200).json({
                status: 'success',
                data: results,
            });
        } catch (error) {
            next(error);
        }
    };

    browseByType = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const qRaw = req.query['q'];
            const qStr = queryString(qRaw);
            const results = await this.exploreService.browseByType(
                param(req, 'type'),
                qStr === '' ? undefined : qStr
            );
            res.status(200).json({
                status: 'success',
                data: results,
            });
        } catch (error) {
            next(error);
        }
    };

    meta = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json({
                status: 'success',
                data: {
                    types: ['user', 'post', 'topic'],
                    endpoints: {
                        featuredOrSearch: 'GET /explore?q= (vacío = destacados)',
                        searchAlias: 'GET /explore/search?q=',
                        browseByType: 'GET /explore/browse/:type?q= (q opcional)',
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    };
}
