import type { FriendRelation } from '../models/user-relation.js';

export class UserRelationService {
    private relations: FriendRelation[] = [];
    private lastId: number = 0;

    // Crear solicitud de amistad
    sendFriendRequest(requesterId: number, receiverId: number): FriendRelation {
        if (requesterId === receiverId) {
            throw new Error("No puedes enviarte solicitud a ti mismo.");
        }

        // Evitar duplicados pendientes o aceptados
        const existing = this.relations.find(
            r =>
                ((r.requesterId === requesterId && r.receiverId === receiverId) ||
                 (r.requesterId === receiverId && r.receiverId === requesterId)) &&
                (r.status === "pending" || r.status === "accepted") // <- control agregado
        );

        if (existing) {
            throw new Error("Ya existe una relación o solicitud entre estos usuarios.");
        }

        const newRelation: FriendRelation = {
            id: ++this.lastId,
            requesterId,
            receiverId,
            status: "pending",
            createdAt: new Date()
        };

        this.relations.push(newRelation);
        return newRelation;
    }

    // Aceptar solicitud
    acceptFriendRequest(requestId: number): FriendRelation {
        const relation = this.relations.find(r => r.id === requestId);
        if (!relation) {
            throw new Error("Solicitud no encontrada.");
        }
        if (relation.status === "accepted") {
            throw new Error("La solicitud ya fue aceptada.");
        }
        relation.status = "accepted";
        return relation;
    }

    // Rechazar solicitud
    rejectFriendRequest(requestId: number): FriendRelation {
        const relation = this.relations.find(r => r.id === requestId);
        if (!relation) {
            throw new Error("Solicitud no encontrada.");
        }
        if (relation.status !== "pending") {
            throw new Error("La solicitud ya fue procesada.");
        }
        relation.status = "rejected";
        return relation;
    }

    // Ver amigos (aceptados)
    getFriends(userId: number): number[] {
        return this.relations
            .filter(r => r.status === "accepted" && (r.requesterId === userId || r.receiverId === userId))
            .map(r => (r.requesterId === userId ? r.receiverId : r.requesterId));
    }

    // Ver solicitudes recibidas (pendientes)
    getReceivedRequests(userId: number): FriendRelation[] {
        return this.relations.filter(r => r.receiverId === userId && r.status === "pending");
    }

    // Ver solicitudes enviadas (pendientes)
    getSentRequests(userId: number): FriendRelation[] {
        return this.relations.filter(r => r.requesterId === userId && r.status === "pending");
    }

    // Borrar todas las relaciones de un usuario (al dar de baja la cuenta)
    removeAllRelationsForUser(userId: number): void {
        this.relations = this.relations.filter(
            r => r.requesterId !== userId && r.receiverId !== userId
        );
    }
}
