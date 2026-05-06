import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/custom-errors.js';
import { UserRepository } from '../repositories/user-repository.js';

const userRepository = new UserRepository();

/** Requiere JWT valido y rol >= 1 (moderador o admin). */
export async function requireModerator(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    const userId = req.userId;
    if (userId === undefined) {
        next(new UnauthorizedError('No token provided'));
        return;
    }

    try {
        const user = await userRepository.findById(userId);
        if (!user || user.role < 1) {
            next(new ForbiddenError('Se requieren permisos de moderador.'));
            return;
        }
        next();
    } catch (e) {
        next(e as Error);
    }
}
