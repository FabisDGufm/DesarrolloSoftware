import type { Request, Response } from 'express';
import { UserRelationService } from '../services/user-relation-service.js';

export class UserRelationController {
    constructor(private readonly service: UserRelationService) {}

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
}
