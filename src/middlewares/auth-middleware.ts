import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const publicPaths = [
    '/auth/v1/login',
    '/user/v1/register',
];

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (publicPaths.includes(req.path)) {
        next();
        return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const jwtSecretKey = process.env.JWT_SECRET_KEY as string;
        jwt.verify(token as string, jwtSecretKey);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};