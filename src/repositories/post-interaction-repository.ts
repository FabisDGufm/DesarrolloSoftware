import {
    DeleteCommand,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamo } from '../config/dynamodb.js';
import type { PostComment } from '../models/post-interaction.js';
import { buildPostPartitionKey } from '../utils/post-key.js';

const TABLE = 'PostInteractions';

export class PostInteractionRepository {
    private pk(authorId: number, postId: number, postCreatedAt: Date): string {
        return buildPostPartitionKey(authorId, postId, postCreatedAt);
    }

    async putLike(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<void> {
        const PK = this.pk(authorId, postId, postCreatedAt);
        const SK = `LIKE#${userId}`;
        const createdAt = new Date().toISOString();
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK,
                    SK,
                    GSI1PK: `USER#${userId}`,
                    GSI1SK: `LIKE#${authorId}#${postId}#${postCreatedAt.getTime()}`,
                    userId,
                    createdAt,
                },
            })
        );
    }

    async deleteLike(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<void> {
        await dynamo.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: {
                    PK: this.pk(authorId, postId, postCreatedAt),
                    SK: `LIKE#${userId}`,
                },
            })
        );
    }

    async getLike(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<boolean> {
        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    PK: this.pk(authorId, postId, postCreatedAt),
                    SK: `LIKE#${userId}`,
                },
            })
        );
        return Boolean(r.Item);
    }

    async listLikes(
        authorId: number,
        postId: number,
        postCreatedAt: Date
    ): Promise<number[]> {
        const userIds: number[] = [];
        let lastKey: Record<string, unknown> | undefined;
        const PK = this.pk(authorId, postId, postCreatedAt);
        do {
            const r = await dynamo.send(
                new QueryCommand({
                    TableName: TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :p)',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':p': 'LIKE#',
                    },
                    ExclusiveStartKey: lastKey,
                })
            );
            for (const item of r.Items ?? []) {
                const uid = item['userId'];
                if (typeof uid === 'number') userIds.push(uid);
            }
            lastKey = r.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (lastKey);
        return userIds;
    }

    async countLikes(
        authorId: number,
        postId: number,
        postCreatedAt: Date
    ): Promise<number> {
        let total = 0;
        let lastKey: Record<string, unknown> | undefined;
        const PK = this.pk(authorId, postId, postCreatedAt);
        do {
            const r = await dynamo.send(
                new QueryCommand({
                    TableName: TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :p)',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':p': 'LIKE#',
                    },
                    Select: 'COUNT',
                    ExclusiveStartKey: lastKey,
                })
            );
            total += r.Count ?? 0;
            lastKey = r.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (lastKey);
        return total;
    }

    async addComment(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number,
        commentId: string,
        text: string
    ): Promise<PostComment> {
        const PK = this.pk(authorId, postId, postCreatedAt);
        const SK = `COMMENT#${commentId}`;
        const createdAt = new Date();
        const createdAtIso = createdAt.toISOString();
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK,
                    SK,
                    GSI1PK: `USER#${userId}`,
                    GSI1SK: `COMMENT#${authorId}#${postId}#${postCreatedAt.getTime()}#${createdAt.getTime()}`,
                    userId,
                    text,
                    createdAt: createdAtIso,
                },
            })
        );
        return { id: commentId, userId, text, createdAt };
    }

    async listComments(
        authorId: number,
        postId: number,
        postCreatedAt: Date
    ): Promise<PostComment[]> {
        const out: PostComment[] = [];
        let lastKey: Record<string, unknown> | undefined;
        const PK = this.pk(authorId, postId, postCreatedAt);
        do {
            const r = await dynamo.send(
                new QueryCommand({
                    TableName: TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :p)',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':p': 'COMMENT#',
                    },
                    ScanIndexForward: true,
                    ExclusiveStartKey: lastKey,
                })
            );
            for (const item of r.Items ?? []) {
                const sk = item['SK'];
                if (typeof sk !== 'string' || !sk.startsWith('COMMENT#')) continue;
                const id = sk.slice('COMMENT#'.length);
                const uid = item['userId'];
                const text = item['text'];
                const ca = item['createdAt'];
                const ua = item['updatedAt'];
                if (
                    typeof uid === 'number' &&
                    typeof text === 'string' &&
                    typeof ca === 'string'
                ) {
                    out.push({
                        id,
                        userId: uid,
                        text,
                        createdAt: new Date(ca),
                        ...(typeof ua === 'string'
                            ? { updatedAt: new Date(ua) }
                            : {}),
                    });
                }
            }
            lastKey = r.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (lastKey);
        return out;
    }

    async getComment(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        commentId: string
    ): Promise<PostComment | null> {
        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    PK: this.pk(authorId, postId, postCreatedAt),
                    SK: `COMMENT#${commentId}`,
                },
            })
        );
        const item = r.Item;
        if (!item) return null;
        const uid = item['userId'];
        const text = item['text'];
        const ca = item['createdAt'];
        const ua = item['updatedAt'];
        if (
            typeof uid !== 'number' ||
            typeof text !== 'string' ||
            typeof ca !== 'string'
        ) {
            return null;
        }
        return {
            id: commentId,
            userId: uid,
            text,
            createdAt: new Date(ca),
            ...(typeof ua === 'string' ? { updatedAt: new Date(ua) } : {}),
        };
    }

    async updateCommentText(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        commentId: string,
        newText: string
    ): Promise<PostComment | null> {
        const PK = this.pk(authorId, postId, postCreatedAt);
        const SK = `COMMENT#${commentId}`;
        const updatedAtIso = new Date().toISOString();
        try {
            const r = await dynamo.send(
                new UpdateCommand({
                    TableName: TABLE,
                    Key: { PK, SK },
                    UpdateExpression: 'SET #t = :text, #u = :ua',
                    ExpressionAttributeNames: { '#t': 'text', '#u': 'updatedAt' },
                    ExpressionAttributeValues: {
                        ':text': newText,
                        ':ua': updatedAtIso,
                    },
                    ConditionExpression: 'attribute_exists(PK)',
                    ReturnValues: 'ALL_NEW',
                })
            );
            const attrs = r.Attributes;
            if (!attrs) return null;
            const uid = attrs['userId'];
            const text = attrs['text'];
            const ca = attrs['createdAt'];
            if (
                typeof uid !== 'number' ||
                typeof text !== 'string' ||
                typeof ca !== 'string'
            ) {
                return null;
            }
            return {
                id: commentId,
                userId: uid,
                text,
                createdAt: new Date(ca),
                updatedAt: new Date(updatedAtIso),
            };
        } catch (err: unknown) {
            const name = err instanceof Error ? err.name : '';
            if (name === 'ConditionalCheckFailedException') {
                return null;
            }
            throw err;
        }
    }

    async deleteComment(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        commentId: string
    ): Promise<void> {
        await dynamo.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: {
                    PK: this.pk(authorId, postId, postCreatedAt),
                    SK: `COMMENT#${commentId}`,
                },
            })
        );
    }

    async recordShare(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<{ shareId: string; createdAt: Date }> {
        const PK = this.pk(authorId, postId, postCreatedAt);
        const ts = Date.now();
        const SK = `SHARE#${userId}#${ts}`;
        const createdAt = new Date();
        const createdAtIso = createdAt.toISOString();
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK,
                    SK,
                    GSI1PK: `USER#${userId}`,
                    GSI1SK: `SHARE#${authorId}#${postId}#${postCreatedAt.getTime()}#${ts}`,
                    userId,
                    createdAt: createdAtIso,
                },
            })
        );
        return { shareId: SK, createdAt };
    }

    async countShares(
        authorId: number,
        postId: number,
        postCreatedAt: Date
    ): Promise<number> {
        let total = 0;
        let lastKey: Record<string, unknown> | undefined;
        const PK = this.pk(authorId, postId, postCreatedAt);
        do {
            const r = await dynamo.send(
                new QueryCommand({
                    TableName: TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :p)',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':p': 'SHARE#',
                    },
                    Select: 'COUNT',
                    ExclusiveStartKey: lastKey,
                })
            );
            total += r.Count ?? 0;
            lastKey = r.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (lastKey);
        return total;
    }

    async putSave(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<void> {
        const PK = this.pk(authorId, postId, postCreatedAt);
        const SK = `SAVE#${userId}`;
        const createdAt = new Date().toISOString();
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK,
                    SK,
                    GSI1PK: `USER#${userId}`,
                    GSI1SK: `SAVE#${authorId}#${postId}#${postCreatedAt.getTime()}`,
                    userId,
                    createdAt,
                },
            })
        );
    }

    async deleteSave(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<void> {
        await dynamo.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: {
                    PK: this.pk(authorId, postId, postCreatedAt),
                    SK: `SAVE#${userId}`,
                },
            })
        );
    }

    async getSave(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<boolean> {
        const r = await dynamo.send(
            new GetCommand({
                TableName: TABLE,
                Key: {
                    PK: this.pk(authorId, postId, postCreatedAt),
                    SK: `SAVE#${userId}`,
                },
            })
        );
        return Boolean(r.Item);
    }

    async listSaves(
        authorId: number,
        postId: number,
        postCreatedAt: Date
    ): Promise<number[]> {
        const userIds: number[] = [];
        let lastKey: Record<string, unknown> | undefined;
        const PK = this.pk(authorId, postId, postCreatedAt);
        do {
            const r = await dynamo.send(
                new QueryCommand({
                    TableName: TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :p)',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':p': 'SAVE#',
                    },
                    ExclusiveStartKey: lastKey,
                })
            );
            for (const item of r.Items ?? []) {
                const uid = item['userId'];
                if (typeof uid === 'number') userIds.push(uid);
            }
            lastKey = r.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (lastKey);
        return userIds;
    }

    async recordRepost(
        authorId: number,
        postId: number,
        postCreatedAt: Date,
        userId: number
    ): Promise<{ repostId: string; createdAt: Date }> {
        const PK = this.pk(authorId, postId, postCreatedAt);
        const ts = Date.now();
        const SK = `REPOST#${userId}#${ts}`;
        const createdAt = new Date();
        const createdAtIso = createdAt.toISOString();
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK,
                    SK,
                    GSI1PK: `USER#${userId}`,
                    GSI1SK: `REPOST#${authorId}#${postId}#${postCreatedAt.getTime()}#${ts}`,
                    userId,
                    createdAt: createdAtIso,
                },
            })
        );
        return { repostId: SK, createdAt };
    }

    async countReposts(
        authorId: number,
        postId: number,
        postCreatedAt: Date
    ): Promise<number> {
        let total = 0;
        let lastKey: Record<string, unknown> | undefined;
        const PK = this.pk(authorId, postId, postCreatedAt);
        do {
            const r = await dynamo.send(
                new QueryCommand({
                    TableName: TABLE,
                    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :p)',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':p': 'REPOST#',
                    },
                    Select: 'COUNT',
                    ExclusiveStartKey: lastKey,
                })
            );
            total += r.Count ?? 0;
            lastKey = r.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (lastKey);
        return total;
    }
}
