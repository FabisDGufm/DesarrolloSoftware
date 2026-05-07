import type { Request, Response, NextFunction } from 'express';

const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://localhost:4200',
];

function parseExtraOrigins(): string[] {
    const raw = process.env.CORS_ORIGINS;
    if (!raw || !raw.trim()) return [];
    return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

function originAllowed(origin: string): boolean {
    if (DEFAULT_ORIGINS.includes(origin)) return true;
    if (parseExtraOrigins().includes(origin)) return true;
    try {
        const host = new URL(origin).hostname;
        return host === 'localhost' || host.endsWith('.amplifyapp.com');
    } catch {
        return false;
    }
}

export const corsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const origin = req.headers.origin;

    if (typeof origin === 'string' && originAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }

    next();
};
