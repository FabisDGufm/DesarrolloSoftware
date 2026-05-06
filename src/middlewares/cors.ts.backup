import type { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Permitir requests desde el frontend
    const allowedOrigins = [
        'http://localhost:5173',  // Vite default
        'http://localhost:3001',  // React default
        'http://localhost:4200',  // Angular default
    ];

    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }

    next();
};