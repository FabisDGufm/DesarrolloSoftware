import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { dynamo } from '../config/dynamodb.js';
import type { DirectMessage } from '../models/message.js';

const TABLE = 'Messages';

function conversationPk(userA: number, userB: number): string {
    const a = Math.min(userA, userB);
    const b = Math.max(userA, userB);
    return `CONV#${a}#${b}`;
}

export class MessageRepository {
    async sendMessage(
        fromUserId: number,
        toUserId: number,
        text: string
    ): Promise<DirectMessage> {
        const PK = conversationPk(fromUserId, toUserId);
        const createdAt = new Date();
        const ts = createdAt.getTime();
        const messageId = randomUUID();
        const SK = `TS#${ts}#${messageId}`;
        const createdAtIso = createdAt.toISOString();

        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK,
                    SK,
                    GSI1PK: `USER#${fromUserId}`,
                    GSI1SK: `TS#${ts}`,
                    fromUserId,
                    toUserId,
                    text,
                    createdAt: createdAtIso,
                },
            })
        );

        return {
            id: messageId,
            fromUserId,
            toUserId,
            text,
            createdAt,
        };
    }

    async listConversation(
        userId: number,
        otherUserId: number,
        limit = 50,
        exclusiveStartKey?: Record<string, unknown>
    ): Promise<{ messages: DirectMessage[]; nextKey?: Record<string, unknown> }> {
        const PK = conversationPk(userId, otherUserId);
        const r = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': PK,
                    ':sk': 'TS#',
                },
                ScanIndexForward: false,
                Limit: limit,
                ExclusiveStartKey: exclusiveStartKey,
            })
        );

        const messages: DirectMessage[] = [];
        for (const item of r.Items ?? []) {
            const sk = item['SK'];
            if (typeof sk !== 'string' || !sk.startsWith('TS#')) continue;
            const parts = sk.split('#');
            const messageId = parts[parts.length - 1];
            if (!messageId) continue;
            const fromUserId = item['fromUserId'];
            const toUserId = item['toUserId'];
            const text = item['text'];
            const ca = item['createdAt'];
            if (
                typeof fromUserId !== 'number' ||
                typeof toUserId !== 'number' ||
                typeof text !== 'string' ||
                typeof ca !== 'string'
            ) {
                continue;
            }
            messages.push({
                id: messageId,
                fromUserId,
                toUserId,
                text,
                createdAt: new Date(ca),
            });
        }

        return {
            messages,
            ...(r.LastEvaluatedKey
                ? { nextKey: r.LastEvaluatedKey as Record<string, unknown> }
                : {}),
        };
    }
}
