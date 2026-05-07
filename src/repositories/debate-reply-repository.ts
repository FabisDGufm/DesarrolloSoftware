import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../config/dynamodb.js";

export interface DebateReply {
    debateId: string;
    createdAt: string;
    replyId: string;
    text: string;
    university: string;
}

const TABLE = "DebateReplies";

export class DebateReplyRepository {
    async create(data: Omit<DebateReply, 'replyId' | 'createdAt'>): Promise<DebateReply> {
        const createdAt = new Date().toISOString();
        const replyId = Math.random().toString(36).slice(2) + Date.now().toString(36);

        const item: DebateReply = {
            ...data,
            createdAt,
            replyId,
        };

        await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));
        return item;
    }

    async listByDebate(debateId: string): Promise<DebateReply[]> {
        const result = await dynamo.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: "debateId = :d",
            ExpressionAttributeValues: { ":d": debateId },
            ScanIndexForward: true,
        }));
        return (result.Items ?? []) as DebateReply[];
    }
}
