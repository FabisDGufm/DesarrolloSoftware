// src/services/user-relation-service.ts
// Refactored to use UserRelationRepository for all data access (async/await)

import type { FriendRelation } from '../models/user-relation.js';
import { UserRelationRepository } from '../repositories/user-relation-repository.js';

export class UserRelationService {
    private repo: UserRelationRepository;

    constructor(repo?: UserRelationRepository) {
        this.repo = repo ?? new UserRelationRepository();
    }

    // Crear solicitud de amistad
    async sendFriendRequest(requesterId: number, receiverId: number): Promise<FriendRelation> {
        if (requesterId === receiverId) {
            throw new Error('No puedes enviarte solicitud a ti mismo.');
        }

        const existing = await this.repo.findExistingRelation(requesterId, receiverId);
        if (existing && (existing.status === 'pending' || existing.status === 'accepted')) {
            throw new Error('Ya existe una relación o solicitud entre estos usuarios.');
        }

        return this.repo.create(requesterId, receiverId);
    }

    // Aceptar solicitud
    async acceptFriendRequest(requestId: number): Promise<FriendRelation> {
        const relation = await this.repo.findById(requestId);
        if (!relation) throw new Error('Solicitud no encontrada.');
        if (relation.status === 'accepted') throw new Error('La solicitud ya fue aceptada.');

        const updated = await this.repo.updateStatus(requestId, 'accepted');
        if (!updated) throw new Error('Solicitud no encontrada.');
        return updated;
    }

    // Rechazar solicitud
    async rejectFriendRequest(requestId: number): Promise<FriendRelation> {
        const relation = await this.repo.findById(requestId);
        if (!relation) throw new Error('Solicitud no encontrada.');
        if (relation.status !== 'pending') throw new Error('La solicitud ya fue procesada.');

        const updated = await this.repo.updateStatus(requestId, 'rejected');
        if (!updated) throw new Error('Solicitud no encontrada.');
        return updated;
    }

    // Ver amigos (aceptados)
    async getFriends(userId: number): Promise<number[]> {
        const relations = await this.repo.findAcceptedByUser(userId);
        return relations.map(r => (r.requesterId === userId ? r.receiverId : r.requesterId));
    }

    // Ver solicitudes recibidas (pendientes)
    async getReceivedRequests(userId: number): Promise<FriendRelation[]> {
        return this.repo.findByReceiver(userId, 'pending');
    }

    // Ver solicitudes enviadas (pendientes)
    async getSentRequests(userId: number): Promise<FriendRelation[]> {
        return this.repo.findByRequester(userId, 'pending');
    }

    // Borrar todas las relaciones de un usuario (al dar de baja la cuenta)
    async removeAllRelationsForUser(userId: number): Promise<void> {
        await this.repo.deleteAllForUser(userId);
    }
}