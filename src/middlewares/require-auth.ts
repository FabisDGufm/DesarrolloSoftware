import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/custom-errors.js';
import type { AuthJwtPayload } from '../types/auth-jwt.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next(new UnauthorizedError('No token provided'));
        return;
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        next(new UnauthorizedError('Server misconfiguration'));
        return;
    }
    try {
        const decoded = jwt.verify(token, secret) as AuthJwtPayload;
        const sub = decoded.sub;
        const userId = typeof sub === 'number' ? sub : Number(sub);
        if (!Number.isFinite(userId) || userId < 1) {
            next(new UnauthorizedError('Invalid token'));
            return;
        }
        req.userId = userId;
        next();
    } catch {
        next(new UnauthorizedError('Invalid token'));
    }
}

/** Sets `req.userId` when a valid Bearer token is sent; otherwise continues without it. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }
    const token = authHeader.slice('Bearer '.length).trim();
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        next();
        return;
    }
    try {
        const decoded = jwt.verify(token, secret) as AuthJwtPayload;
        const sub = decoded.sub;
        const userId = typeof sub === 'number' ? sub : Number(sub);
        if (Number.isFinite(userId) && userId >= 1) {
            req.userId = userId;
        }
    } catch {
        /* invalid token on optional route — ignore */
    }
    next();
}
