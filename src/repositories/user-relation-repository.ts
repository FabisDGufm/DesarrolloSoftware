// src/repositories/user-relation-repository.ts
// Simulated database repository for FriendRelation entities

import type { FriendRelation, FriendRequestStatus } from '../models/user-relation.js';

// Simulated in-memory "database"
const db: { relations: FriendRelation[] } = { relations: [] };
let autoIncrement = 0;

const simulateDelay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));

export class UserRelationRepository {

    async findAll(): Promise<FriendRelation[]> {
        await simulateDelay();
        console.log('[DB] SELECT * FROM friend_relations');
        return [...db.relations];
    }

    async findById(id: number): Promise<FriendRelation | null> {
        await simulateDelay();
        console.log(`[DB] SELECT * FROM friend_relations WHERE id = ${id}`);
        return db.relations.find(r => r.id === id) ?? null;
    }

    async findExistingRelation(userAId: number, userBId: number): Promise<FriendRelation | null> {
        await simulateDelay();
        console.log(
            `[DB] SELECT * FROM friend_relations WHERE ` +
            `(requester_id = ${userAId} AND receiver_id = ${userBId}) OR ` +
            `(requester_id = ${userBId} AND receiver_id = ${userAId})`
        );
        return (
            db.relations.find(
                r =>
                    (r.requesterId === userAId && r.receiverId === userBId) ||
                    (r.requesterId === userBId && r.receiverId === userAId)
            ) ?? null
        );
    }

    async findByReceiver(receiverId: number, status?: FriendRequestStatus): Promise<FriendRelation[]> {
        await simulateDelay();
        console.log(
            `[DB] SELECT * FROM friend_relations WHERE receiver_id = ${receiverId}` +
            (status ? ` AND status = '${status}'` : '')
        );
        return db.relations.filter(
            r => r.receiverId === receiverId && (status ? r.status === status : true)
        );
    }

    async findByRequester(requesterId: number, status?: FriendRequestStatus): Promise<FriendRelation[]> {
        await simulateDelay();
        console.log(
            `[DB] SELECT * FROM friend_relations WHERE requester_id = ${requesterId}` +
            (status ? ` AND status = '${status}'` : '')
        );
        return db.relations.filter(
            r => r.requesterId === requesterId && (status ? r.status === status : true)
        );
    }

    async findAcceptedByUser(userId: number): Promise<FriendRelation[]> {
        await simulateDelay();
        console.log(
            `[DB] SELECT * FROM friend_relations ` +
            `WHERE status = 'accepted' AND (requester_id = ${userId} OR receiver_id = ${userId})`
        );
        return db.relations.filter(
            r => r.status === 'accepted' && (r.requesterId === userId || r.receiverId === userId)
        );
    }

    async create(requesterId: number, receiverId: number): Promise<FriendRelation> {
        await simulateDelay();
        const newRelation: FriendRelation = {
            id: ++autoIncrement,
            requesterId,
            receiverId,
            status: 'pending',
            createdAt: new Date()
        };
        db.relations.push(newRelation);
        console.log(
            `[DB] INSERT INTO friend_relations (requester_id, receiver_id, status) ` +
            `VALUES (${requesterId}, ${receiverId}, 'pending')`
        );
        return { ...newRelation };
    }

    async updateStatus(id: number, status: FriendRequestStatus): Promise<FriendRelation | null> {
        await simulateDelay();
        const relation = db.relations.find(r => r.id === id);
        if (!relation) return null;
        relation.status = status;
        console.log(`[DB] UPDATE friend_relations SET status = '${status}' WHERE id = ${id}`);
        return { ...relation };
    }

    async deleteAllForUser(userId: number): Promise<number> {
        await simulateDelay();
        const before = db.relations.length;
        db.relations = db.relations.filter(
            r => r.requesterId !== userId && r.receiverId !== userId
        );
        const deleted = before - db.relations.length;
        console.log(
            `[DB] DELETE FROM friend_relations WHERE requester_id = ${userId} OR receiver_id = ${userId} ` +
            `-- ${deleted} rows affected`
        );
        return deleted;
    }
}