// src/repositories/feed-repository.ts
// Reemplaza la versión en memoria — ahora usa DynamoDB

import { PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamodb.js";
import type { FeedItem } from "../models/feed.js";

const TABLE = "Feed";

export class FeedRepository {

    // Obtener todos los posts del feed (todos los usuarios, para demo)
    // En producción filtrarías por userId
    async getFeed(): Promise<FeedItem[]> {
        // Como getFeed() no recibe parámetros en tu servicio actual,
        // hacemos un query por todos los items. En el futuro puedes
        // agregar getFeedByUser(userId) cuando conectes el auth.
        const { items } = await this.getFeedByUser(0, 50); // 0 = global feed
        return items;
    }

    // Obtener feed de un usuario específico (paginado)
    async getFeedByUser(
        authorId: number,
        limit = 20,
        lastKey?: Record<string, any>
    ): Promise<{ items: FeedItem[]; nextKey?: Record<string, any> }> {
        const result = await dynamo.send(
            new QueryCommand({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `USER#${authorId}`,
                },
                ScanIndexForward: false, // más reciente primero
                Limit: limit,
                ExclusiveStartKey: lastKey,
            })
        );

        const items: FeedItem[] = (result.Items ?? []).map((i) => ({
            id: i.id,
            authorId: i.authorId,
            content: i.content,
            createdAt: new Date(i.createdAt),
        }));

       return {
    items,
    ...(result.LastEvaluatedKey ? { nextKey: result.LastEvaluatedKey } : {}),
};
    }

    // Crear un post en el feed
    async createFeedItem(item: FeedItem): Promise<FeedItem> {
        const ts = item.createdAt.getTime();

        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK: `USER#${item.authorId}`,
                    SK: `TS#${ts}#${item.id}`,
                    id: item.id,
                    authorId: item.authorId,
                    content: item.content,
                    createdAt: item.createdAt.toISOString(),
                },
            })
        );

        return item;
    }

    // Eliminar un post del feed
    async deleteFeedItem(authorId: number, id: number, createdAt: Date): Promise<void> {
        const ts = createdAt.getTime();

        await dynamo.send(
            new DeleteCommand({
                TableName: TABLE,
                Key: {
                    PK: `USER#${authorId}`,
                    SK: `TS#${ts}#${id}`,
                },
            })
        );
    }
}