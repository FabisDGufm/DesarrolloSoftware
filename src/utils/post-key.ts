import { ValidationError } from './custom-errors.js';

/**
 * Builds the DynamoDB partition key for a feed post (must match the post's authorId, id, createdAt).
 */
export function buildPostPartitionKey(
    authorId: number,
    postId: number,
    createdAt: Date
): string {
    return `POST#${authorId}#${postId}#${createdAt.getTime()}`;
}

export function parsePostCreatedAt(value: unknown): Date {
    if (typeof value !== 'string' || !value.trim()) {
        throw new ValidationError('createdAt is required (ISO date string)');
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        throw new ValidationError('createdAt must be a valid ISO date');
    }
    return d;
}

export function parsePositiveIntParam(value: string, name: string): number {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n < 1) {
        throw new ValidationError(`${name} must be a positive integer`);
    }
    return n;
}
