/**
 * Mensajes de espacios de ayuda académica en la misma tabla Dynamo `Messages`
 * que los DM, con patrón de partición distinto:
 *
 *   PK = SPACE#<slug>        (ej. SPACE#matematicas)
 *   SK = TS#<ts>#<messageId>
 *
 * Atributos: fromUserId, text, createdAt (ISO). toUserId = 0 indica mensaje de sala
 * (compatibilidad con ítems que esperan número en otros flujos).
 */
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import { dynamo } from '../config/dynamodb.js';
import type { HelpSpaceMessage } from '../models/help-space.js';

const TABLE = 'Messages';

function spacePk(slug: string): string {
    return `SPACE#${slug}`;
}

export class HelpSpaceRepository {
    async listMessages(
        spaceSlug: string,
        limit = 50,
        exclusiveStartKey?: Record<string, unknown>
    ): Promise<{ messages: HelpSpaceMessage[]; nextKey?: Record<string, unknown> }> {
        const r = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
                ExpressionAttributeValues: {
                    ':pk': spacePk(spaceSlug),
                    ':sk': 'TS#',
                },
                ScanIndexForward: false,
                Limit: limit,
                ExclusiveStartKey: exclusiveStartKey,
            })
        );

        const messages: HelpSpaceMessage[] = [];
        for (const item of r.Items ?? []) {
            const sk = item['SK'];
            if (typeof sk !== 'string' || !sk.startsWith('TS#')) continue;
            const parts = sk.split('#');
            const messageId = parts[parts.length - 1];
            if (!messageId) continue;
            const fromUserId = item['fromUserId'];
            const text = item['text'];
            const ca = item['createdAt'];
            if (
                typeof fromUserId !== 'number' ||
                typeof text !== 'string' ||
                typeof ca !== 'string'
            ) {
                continue;
            }
            messages.push({
                id: messageId,
                spaceSlug,
                fromUserId,
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

    async postMessage(
        spaceSlug: string,
        fromUserId: number,
        text: string
    ): Promise<HelpSpaceMessage> {
        const createdAt = new Date();
        const ts = createdAt.getTime();
        const messageId = randomUUID();
        const SK = `TS#${ts}#${messageId}`;
        const createdAtIso = createdAt.toISOString();

        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK: spacePk(spaceSlug),
                    SK,
                    fromUserId,
                    toUserId: 0,
                    text,
                    createdAt: createdAtIso,
                    GSI1PK: `USER#${fromUserId}`,
                    GSI1SK: `TS#${ts}`,
                },
            })
        );

        return {
            id: messageId,
            spaceSlug,
            fromUserId,
            text,
            createdAt,
        };
    }
}
