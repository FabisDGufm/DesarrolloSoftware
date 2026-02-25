import type { Request, Response, NextFunction } from 'express';
import type { UserRelationService } from '../services/user-relation-service.js';
import type { UserService } from '../services/user-service.js';
import { ValidationError } from '../utils/custom-errors.js';

export class UserRelationController {
    constructor(
        private readonly service: UserRelationService,
        private readonly userService: UserService
    ) {}

    // Crear solicitud de amistad
    sendRequest = (_req: Request, _res: Response) => {
        const requesterId = Number(_req.params.id);
        const receiverId = Number(_req.params.targetId);
        try {
            const result = this.service.sendFriendRequest(requesterId, receiverId);
            _res.json(result);
        } catch (err: any) {
            _res.status(400).json({ error: err.message });
        }
    }

    // Aceptar solicitud
    acceptRequest = (_req: Request, _res: Response) => {
        const requestId = Number(_req.params.requestId);
        try {
            const result = this.service.acceptFriendRequest(requestId);
            _res.json(result);
        } catch (err: any) {
            _res.status(400).json({ error: err.message });
        }
    }

    // Rechazar solicitud
    rejectRequest = (_req: Request, _res: Response) => {
        const requestId = Number(_req.params.requestId);
        try {
            const result = this.service.rejectFriendRequest(requestId);
            _res.json(result);
        } catch (err: any) {
            _res.status(400).json({ error: err.message });
        }
    }

    // Ver amigos
    getFriends = (_req: Request, _res: Response) => {
        const userId = Number(_req.params.id);
        const friends = this.service.getFriends(userId);
        _res.json(friends);
    }

    // Solicitudes recibidas
    getReceivedRequests = (_req: Request, _res: Response) => {
        const userId = Number(_req.params.id);
        const requests = this.service.getReceivedRequests(userId);
        _res.json(requests);
    }

    // Solicitudes enviadas
    getSentRequests = (_req: Request, _res: Response) => {
        const userId = Number(_req.params.id);
        const requests = this.service.getSentRequests(userId);
        _res.json(requests);
    }

    // Update perfil: nombre y/o foto
    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;
            const { name, profilePhoto } = req.body; // body puede tener name y/o profilePhoto

            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }

            const id = Number(idParam);
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }

            let user = this.userService.getUserById(id);

            if (name !== undefined && name !== '') {
                user = this.userService.updateUserN(id, name);
            }
            if (profilePhoto !== undefined) {
                user = this.userService.updateProfilePhoto(id, profilePhoto);
            }

            res.status(200).json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    }

    // Delete cuenta: borrar usuario y sus relaciones
    deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParam = req.params.id;

            if (!idParam) {
                throw new ValidationError('ID parameter is required');
            }

            const id = Number(idParam);
            if (isNaN(id)) {
                throw new ValidationError('Invalid ID format');
            }

            this.service.removeAllRelationsForUser(id); // primero relaciones
            const result = this.userService.deleteUser(id); // luego usuario

            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
