import type { DirectMessage } from '../models/message.js';
import { MessageRepository } from '../repositories/message-repository.js';
import { ValidationError } from '../utils/custom-errors.js';

export class MessageService {
    constructor(private readonly repo: MessageRepository) {}

    async send(fromUserId: number, body: { toUserId?: unknown; text?: unknown }): Promise<DirectMessage> {
        const toRaw = body.toUserId;
        const toUserId =
            typeof toRaw === 'number'
                ? toRaw
                : typeof toRaw === 'string'
                  ? Number.parseInt(toRaw, 10)
                  : NaN;
        if (!Number.isFinite(toUserId) || toUserId < 1) {
            throw new ValidationError('toUserId must be a positive integer');
        }
        if (toUserId === fromUserId) {
            throw new ValidationError('Cannot send a message to yourself');
        }
        if (typeof body.text !== 'string' || !body.text.trim()) {
            throw new ValidationError('text is required');
        }
        return this.repo.sendMessage(fromUserId, toUserId, body.text.trim());
    }

    async listConversation(
        userId: number,
        otherUserIdRaw: string,
        limitRaw?: unknown,
        exclusiveStartKey?: Record<string, unknown>
    ): Promise<{ messages: DirectMessage[]; nextKey?: Record<string, unknown> }> {
        const otherUserId = Number.parseInt(otherUserIdRaw, 10);
        if (!Number.isFinite(otherUserId) || otherUserId < 1) {
            throw new ValidationError('otherUserId must be a positive integer');
        }
        if (otherUserId === userId) {
            throw new ValidationError('otherUserId must be different from the current user');
        }
        let limit = 50;
        if (limitRaw !== undefined && limitRaw !== null && limitRaw !== '') {
            const n =
                typeof limitRaw === 'number'
                    ? limitRaw
                    : Number.parseInt(String(limitRaw), 10);
            if (!Number.isFinite(n) || n < 1 || n > 100) {
                throw new ValidationError('limit must be between 1 and 100');
            }
            limit = n;
        }
        return this.repo.listConversation(userId, otherUserId, limit, exclusiveStartKey);
    }
}
