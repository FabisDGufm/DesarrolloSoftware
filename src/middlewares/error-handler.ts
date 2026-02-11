import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/custom-errors.js';

interface ErrorResponse {
    status: 'error';
    statusCode: number;
    message: string;
    stack?: string;
}

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    // Si es un error personalizado
    if (err instanceof AppError) {
        const response: ErrorResponse = {
            status: 'error',
            statusCode: err.statusCode,
            message: err.message
        };

        // En desarrollo, incluir el stack trace
        if (isDevelopment && err.stack) {
            response.stack = err.stack;
        }

        res.status(err.statusCode).json(response);
        return;
    }

    // Error genérico (no controlado)
    const response: ErrorResponse = {
        status: 'error',
        statusCode: 500,
        message: isProduction ? 'Internal server error' : err.message
    };

    if (isDevelopment && err.stack) {
        response.stack = err.stack;
    }

    res.status(500).json(response);
};

// Middleware para rutas no encontradas
export const notFoundHandler = (
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: `Route ${req.originalUrl} not found`
    });
};