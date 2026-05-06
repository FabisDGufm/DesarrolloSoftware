import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/custom-errors.js';
import { UserRepository } from '../repositories/user-repository.js';

const userRepository = new UserRepository();

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Tras `requireAuth`: bloquea cuentas BANNED (cualquier metodo) y SUSPENDED en escrituras.
 * Reactiva automaticamente si `suspendedUntil` ya paso.
 */
export async function enforceModerationPolicy(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    const userId = req.userId;
    if (userId === undefined) {
        next();
        return;
    }

    try {
        await userRepository.clearExpiredSuspension(userId);
        const user = await userRepository.findById(userId);
        if (!user) {
            next(new ForbiddenError('Usuario no encontrado.'));
            return;
        }

        const status = user.accountStatus.toUpperCase();

        if (status === 'BANNED') {
            next(
                new ForbiddenError(
                    'Tu cuenta fue inhabilitada. No podes usar esta accion.'
                )
            );
            return;
        }

        if (status === 'SUSPENDED') {
            const until = user.suspendedUntil;
            const stillSuspended =
                until == null || Number.isNaN(new Date(until).getTime())
                    ? true
                    : new Date(until) > new Date();
            if (stillSuspended && WRITE_METHODS.has(req.method)) {
                const msg =
                    until && !Number.isNaN(new Date(until).getTime())
                        ? `Tu cuenta esta suspendida hasta ${new Date(until).toISOString()}. Solo podes navegar en lectura.`
                        : 'Tu cuenta esta suspendida. Solo podes navegar en lectura.';
                next(new ForbiddenError(msg));
                return;
            }
        }

        next();
    } catch (e) {
        next(e as Error);
    }
}
