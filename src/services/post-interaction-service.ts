import { randomUUID } from 'node:crypto';
import type { PostComment, PostLikeSummary } from '../models/post-interaction.js';
import type { PostInteractionRepository } from '../repositories/post-interaction-repository.js';
import {
    parsePostCreatedAt,
    parsePositiveIntParam,
} from '../utils/post-key.js';
import {
    ForbiddenError,
    NotFoundError,
    ValidationError,
} from '../utils/custom-errors.js';

export class PostInteractionService {
    constructor(private readonly repo: PostInteractionRepository) {}

    private resolvePost(
        authorIdRaw: string,
        postIdRaw: string,
        createdAtRaw: unknown
    ): { authorId: number; postId: number; postCreatedAt: Date } {
        const authorId = parsePositiveIntParam(authorIdRaw, 'authorId');
        const postId = parsePositiveIntParam(postIdRaw, 'postId');
        const postCreatedAt = parsePostCreatedAt(createdAtRaw);
        return { authorId, postId, postCreatedAt };
    }

    async like(
        userId: number,
        authorIdRaw: string,
        postIdRaw: string,
        body: { createdAt?: unknown }
    ): Promise<{ ok: true }> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            body.createdAt
        );
        await this.repo.putLike(authorId, postId, postCreatedAt, userId);
        return { ok: true };
    }

    async unlike(
        userId: number,
        authorIdRaw: string,
        postIdRaw: string,
        body: { createdAt?: unknown }
    ): Promise<{ ok: true }> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            body.createdAt
        );
        await this.repo.deleteLike(authorId, postId, postCreatedAt, userId);
        return { ok: true };
    }

    async getLikesSummary(
        viewerUserId: number | undefined,
        authorIdRaw: string,
        postIdRaw: string,
        createdAtRaw: unknown
    ): Promise<PostLikeSummary> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            createdAtRaw
        );
        const userIds = await this.repo.listLikes(authorId, postId, postCreatedAt);
        const likedByMe =
            viewerUserId !== undefined
                ? await this.repo.getLike(
                      authorId,
                      postId,
                      postCreatedAt,
                      viewerUserId
                  )
                : false;
        return {
            userIds,
            count: userIds.length,
            likedByMe,
        };
    }

    async addComment(
        userId: number,
        authorIdRaw: string,
        postIdRaw: string,
        body: { createdAt?: unknown; text?: unknown }
    ): Promise<PostComment> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            body.createdAt
        );
        if (typeof body.text !== 'string' || !body.text.trim()) {
            throw new ValidationError('text is required');
        }
        const commentId = randomUUID();
        return this.repo.addComment(
            authorId,
            postId,
            postCreatedAt,
            userId,
            commentId,
            body.text.trim()
        );
    }

    async getComments(
        authorIdRaw: string,
        postIdRaw: string,
        createdAtRaw: unknown
    ): Promise<PostComment[]> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            createdAtRaw
        );
        return this.repo.listComments(authorId, postId, postCreatedAt);
    }

    async updateComment(
        userId: number,
        authorIdRaw: string,
        postIdRaw: string,
        commentId: string,
        body: { createdAt?: unknown; text?: unknown }
    ): Promise<PostComment> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            body.createdAt
        );
        if (!commentId?.trim()) {
            throw new ValidationError('commentId is required');
        }
        if (typeof body.text !== 'string' || !body.text.trim()) {
            throw new ValidationError('text is required');
        }
        const existing = await this.repo.getComment(
            authorId,
            postId,
            postCreatedAt,
            commentId
        );
        if (!existing) {
            throw new NotFoundError('Comment not found');
        }
        if (existing.userId !== userId) {
            throw new ForbiddenError('You can only edit your own comments');
        }
        const updated = await this.repo.updateCommentText(
            authorId,
            postId,
            postCreatedAt,
            commentId,
            body.text.trim()
        );
        if (!updated) {
            throw new NotFoundError('Comment not found');
        }
        return updated;
    }

    async deleteComment(
        userId: number,
        authorIdRaw: string,
        postIdRaw: string,
        commentId: string,
        body: { createdAt?: unknown }
    ): Promise<{ ok: true }> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            body.createdAt
        );
        if (!commentId?.trim()) {
            throw new ValidationError('commentId is required');
        }
        const comment = await this.repo.getComment(
            authorId,
            postId,
            postCreatedAt,
            commentId
        );
        if (!comment) {
            throw new NotFoundError('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new ForbiddenError('You can only delete your own comments');
        }
        await this.repo.deleteComment(
            authorId,
            postId,
            postCreatedAt,
            commentId
        );
        return { ok: true };
    }

    async share(
        userId: number,
        authorIdRaw: string,
        postIdRaw: string,
        body: { createdAt?: unknown }
    ): Promise<{ shareId: string; createdAt: string }> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            body.createdAt
        );
        const r = await this.repo.recordShare(
            authorId,
            postId,
            postCreatedAt,
            userId
        );
        return { shareId: r.shareId, createdAt: r.createdAt.toISOString() };
    }

    async getShareStats(
        authorIdRaw: string,
        postIdRaw: string,
        createdAtRaw: unknown
    ): Promise<{ count: number }> {
        const { authorId, postId, postCreatedAt } = this.resolvePost(
            authorIdRaw,
            postIdRaw,
            createdAtRaw
        );
        const count = await this.repo.countShares(
            authorId,
            postId,
            postCreatedAt
        );
        return { count };
    }
}
