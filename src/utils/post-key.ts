import { ValidationError } from './custom-errors.js';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Builds the DynamoDB partition key for a post (authorId, post id or UUID, createdAt timestamp).
 */
export function buildPostPartitionKey(
    authorId: number,
    postId: string,
    createdAt: Date
): string {
    return `POST#${authorId}#${postId}#${createdAt.getTime()}`;
}

/** Accepts a legacy numeric feed id or a Posts-table UUID string. */
export function parsePostIdParam(value: string, name: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new ValidationError(`${name} is required`);
    }
    if (UUID_RE.test(trimmed)) {
        return trimmed;
    }
    const n = Number.parseInt(trimmed, 10);
    if (Number.isFinite(n) && n >= 1) {
        return String(n);
    }
    throw new ValidationError(`${name} must be a positive integer id or a UUID`);
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
