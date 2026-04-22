// src/repositories/explore-repository.ts
// Reemplaza la versión en memoria — ahora usa DynamoDB

import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamodb.js";
import type { ExploreResult } from "../models/explore.js";

const TABLE = "Explore";

export class ExploreRepository {
    /**
     * Muestra ítems indexados en Explore (sin filtro de texto).
     * Scan acotado; en producción se usaría feed curado u OpenSearch.
     */
    async listFeatured(limit = 50): Promise<ExploreResult[]> {
        const result = await dynamo.send(
            new ScanCommand({
                TableName: TABLE,
                Limit: limit,
            })
        );
        return (result.Items ?? []).map((i) => ({
            id: i.id as number,
            type: i.type as "user" | "post" | "topic",
            title: i.title as string,
            snippet: i.snippet as string,
        }));
    }

    // Buscar por query — filtra por title o snippet que contengan el texto
    async search(query: string): Promise<ExploreResult[]> {
        const lowerQuery = query.toLowerCase();

        // DynamoDB no tiene full-text search nativo, usamos Scan con FilterExpression
        // Para producción real se usaría OpenSearch, pero para el proyecto esto funciona
        const result = await dynamo.send(
            new ScanCommand({
                TableName: TABLE,
                FilterExpression:
                    "contains(lowerTitle, :q) OR contains(lowerSnippet, :q)",
                ExpressionAttributeValues: {
                    ":q": lowerQuery,
                },
            })
        );

        return (result.Items ?? []).map((i) => ({
            id: i.id,
            type: i.type as "user" | "post" | "topic",
            title: i.title,
            snippet: i.snippet,
        }));
    }

    // Buscar por tipo específico (user | post | topic)
    async searchByType(
        type: "user" | "post" | "topic",
        query?: string
    ): Promise<ExploreResult[]> {
        const params: any = {
            TableName: TABLE,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
                ":pk": `TYPE#${type}`,
            },
        };

        if (query) {
            params.FilterExpression = "contains(lowerTitle, :q) OR contains(lowerSnippet, :q)";
            params.ExpressionAttributeValues[":q"] = query.toLowerCase();
        }

        const result = await dynamo.send(new QueryCommand(params));

        return (result.Items ?? []).map((i) => ({
            id: i.id,
            type: i.type as "user" | "post" | "topic",
            title: i.title,
            snippet: i.snippet,
        }));
    }

    // Indexar un resultado (se llama cuando se crea un user/post/topic)
    async indexItem(item: ExploreResult): Promise<void> {
        await dynamo.send(
            new PutCommand({
                TableName: TABLE,
                Item: {
                    PK: `TYPE#${item.type}`,
                    SK: `ID#${item.id}`,
                    id: item.id,
                    type: item.type,
                    title: item.title,
                    snippet: item.snippet,
                    // versiones en minúscula para búsqueda case-insensitive
                    lowerTitle: item.title.toLowerCase(),
                    lowerSnippet: item.snippet.toLowerCase(),
                },
            })
        );
    }
}