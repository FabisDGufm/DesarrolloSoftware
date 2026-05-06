import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamodb.js";
import type { AnonDebate, CreateAnonDebateDTO } from "../models/anon-debate.js";


const TABLE = "AnonDebates";

export class AnonDebateRepository {
    async create(data: CreateAnonDebateDTO): Promise<AnonDebate> {
        const createdAt = new Date().toISOString();
        const debateId = Math.random().toString(36).slice(2) + Date.now().toString(36);

        const item: AnonDebate = {
            university: data.university,
            createdAt,
            debateId,
            text: data.text,
        };

        await dynamo.send(new PutCommand({
            TableName: TABLE,
            Item: item,
        }));

        return item;
    }

    async listAll(limit = 50): Promise<AnonDebate[]> {
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE,
            Limit: limit,
        }));

        const items = (result.Items ?? []) as AnonDebate[];
        return items.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    async listByUniversity(university: string, limit = 50): Promise<AnonDebate[]> {
        const result = await dynamo.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "university = :u",
            ExpressionAttributeValues: { ":u": university },
            Limit: limit,
            ScanIndexForward: false,
        }));

        return (result.Items ?? []) as AnonDebate[];
    }
}
